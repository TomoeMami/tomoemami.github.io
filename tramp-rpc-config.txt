(use-package tramp)
(use-package tramp-rpc
  :after tramp :demand t
  :vc (:url "git@github.com:ArthurHeymans/emacs-tramp-rpc.git"
       :rev :newest
       :lisp-dir "lisp")

  :custom
  (tramp-rpc-deploy-release-url-format "https://gh-proxy.org/https://github.com/%s/releases/download/v%s/%s")

  :config
  (setq tramp-default-method "rpc")

  (when (eq system-type 'windows-nt)
    (setq tramp-rpc-use-controlmaster nil)))

(setq tramp-persistency-file-name "~/emacs-local/tramp")
