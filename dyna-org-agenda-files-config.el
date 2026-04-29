(use-package denote-agenda
  :demand t :after denote
  :config
  ;; 设置org-agenda的默认文件，这里的参数是一个包含文件名的列表
  (defun adv/set-denote-agenda-static-files (&rest _)
    (setq denote-agenda-static-files (directory-files my/org-dir1 t "\\.org$")))
  (advice-add #'denote-agenda-set-agenda-files :before #'adv/set-denote-agenda-static-files)
  ;; 设置需要添加进`agenda-files'的`denote'文件的`regexp'
  (setq denote-agenda-include-regexp "_agenda")
  ;; 下面的函数会往`denote-agenda-static-files'里添加符合`include-regexp'的`denote'文件，并将该结果设置为`org-agenda-files'
  (denote-agenda-insinuate))

(defun vulpea-project-p ()
  "如果当前buffer含有任何TODO项，则返回非空。"
  (seq-find                                 ; (3)
   (lambda (type)
     (eq type 'todo))
   (org-element-map                         ; (2)
       (org-element-parse-buffer 'headline) ; (1)
       'headline
     (lambda (h)
       (org-element-property :todo-type h)))))

(defun vulpea-buffer-p ()
  "如果当前buffer是一个'指定路径'中的'org'文件，则返回非空。"
  (and buffer-file-name
       (eq major-mode 'org-mode)
       (string-suffix-p "org" buffer-file-name)
       (string-prefix-p
        (expand-file-name (file-name-as-directory denote-directory))
        (file-name-directory buffer-file-name))))

(defun vulpea-buffer-prop-set (name value)
  "为当前buffer添加全局属性'name'，并使其值为'value'。会覆盖现有值。"
  (setq name (downcase name))
  (org-with-point-at 1
    (let ((case-fold-search t))
      (if (re-search-forward (concat "^#\\+" name ":\\(.*\\)")
                             (point-max) t)
          (replace-match (concat "#+" name ": " value) 'fixedcase)
        (while (and (not (eobp))
                    (looking-at "^[#:]"))
          (if (save-excursion (end-of-line) (eobp))
              (progn
                (end-of-line)
                (insert "\n"))
            (forward-line)
            (beginning-of-line)))
        (insert "#+" name ": " value "\n")))))

(defun vulpea-buffer-prop-remove (name)
  "移除当前buffer名称为'name'的属性"
  (org-with-point-at 1
    (when (re-search-forward (concat "\\(^#\\+" name ":.*\n?\\)")
                             (point-max) t)
      (replace-match ""))))

(defun vulpea-buffer-tags-set (&rest tags)
  "设置当前buffer的'filetags'属性"
  (if tags
      (vulpea-buffer-prop-set
       "filetags" (concat ":" (string-join tags ":") ":"))
    (vulpea-buffer-prop-remove "filetags")))

(defun vulpea-buffer-prop-get (name)
  "获取当前buffer的'name'属性值为字符串"
  (org-with-point-at 1
    (when (re-search-forward (concat "^#\\+" name ": \\(.*\\)")
                             (point-max) t)
      (let ((value (string-trim
                    (buffer-substring-no-properties
                     (match-beginning 1)
                     (match-end 1)))))
        (unless (string-empty-p value)
          value)))))

(defun vulpea-buffer-prop-get-list (name &optional separators)
  "获取当前buffer的'name'属性值为列表，用可选的'separator'分割。

如果'separator'非空，则应为一个匹配分割字符的正则；如果为空，则默认设置为`split-string-default-separators'，通常为\"[ \f\t\n\r\v]+\"，并且 'omit-nulls' 强制为 't'。"
  (let ((value (vulpea-buffer-prop-get name)))
    (when value
      (split-string-and-unquote value separators))))


(defun vulpea-buffer-tags-get ()
  "返回当前buffer的'filetags'值为列表"
  (vulpea-buffer-prop-get-list "filetags" "[ :]"))

(defun vulpea-project-update-tag ()
  "为当前buffer的'filetags'属性添加'agenda'值"
  (when (and (not (active-minibuffer-window))
             (vulpea-buffer-p))
    (save-excursion
      (goto-char (point-min))
      (let* ((tags (vulpea-buffer-tags-get))
             (original-tags tags))
        (if (vulpea-project-p)
            (setq tags (cons "agenda" tags))
          (setq tags (remove "agenda" tags)))

        ;; cleanup duplicates
        (setq tags (seq-uniq tags))

        ;; update tags if changed
        (when (or (seq-difference tags original-tags)
                  (seq-difference original-tags tags))
          (apply #'vulpea-buffer-tags-set tags))))))

;; 每次保存之前都运行一下更新tag命令
(add-hook 'before-save-hook #'vulpea-project-update-tag)

;; 来自denote官方手册 https://protesilaos.com/emacs/denote#h:c7d4dd3a-38bb-4f1c-a36e-989ec0bc79a6
(defun my/denote-rename-on-save-based-on-front-matter ()
  "重命名当前Denote文件，如果需要的话再次保存。
重命名相关信息来自于front matter。
需要把该函数添加到`after-save-hook'。"
  ;; 局部关闭重命名提醒
  (let ((denote-rename-confirmations nil)
        (denote-save-buffers t)) ; to save again post-rename
    (when (and buffer-file-name
               (denote-file-is-note-p buffer-file-name)
               (or ;;只在front-matter和文件名的keyword/title/identifier不等的时候触发，减少大文件保存资源消耗。我目前没用到signature，所以忽略了。
                (not (equal (when (vulpea-buffer-tags-get) (mapconcat #'identity (vulpea-buffer-tags-get) "_"))
                            (denote-retrieve-filename-keywords buffer-file-name)))
                (not (equal (downcase (vulpea-buffer-prop-get "title")) ;;因为作为文件名的title全小写
                            (denote-retrieve-filename-title buffer-file-name)))
                (not (equal (vulpea-buffer-prop-get "identifier")
                            (denote-retrieve-filename-identifier buffer-file-name)))))
      (denote--rename-file buffer-file-name (vulpea-buffer-prop-get "title") (vulpea-buffer-tags-get) "" (denote-valid-date-p (vulpea-buffer-prop-get "identifier")) (vulpea-buffer-prop-get "identifier"))
      (message "Denote file name updated")
      (denote-agenda-set-agenda-files))))

(add-hook 'after-save-hook #'my/denote-rename-on-save-based-on-front-matter)
