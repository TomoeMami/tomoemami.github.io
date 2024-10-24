# -*- coding: UTF-8 -*-
import re,json,os,collections
from pathlib import Path
from datetime import datetime
import pandas as pd

def mkdir(path):
    # 去除首位空格
    path=path.strip()
    # 去除尾部 \ 符号
    path=path.rstrip("\\")
    path=path.encode('utf-8')
    # 判断路径是否存在
    # 存在     True
    # 不存在   False
    isExists=os.path.exists(path)
    # 判断结果
    if not isExists:
        os.makedirs(path)
        return True
    else:
        # 如果目录存在则不创建，并提示目录已存在
        return False


def find_time(file_path):
    with open (file_path, 'r',encoding='UTF-8') as f:
        lines = f.readlines()
        a = ''
        for line in lines:
            a += line.strip()
    b = a.split("*****")
    res = []
    for post in b:
        post_time = ''.join(re.findall(r"^.*?发表于\s(\d{4}-\d{1,2}-\d{1,2})", post))
        res.append(post_time)
    return res

def filter_time(troll,input_list):
    return_dict = dict(collections.Counter(input_list))
    for i in list(return_dict.keys()):
        if return_dict[i] < 45 or i not in date_list:
            return_dict.pop(i)
        #外野数据量太大，提高筛选标准
        elif troll =='troll' and return_dict[i] < 90:
            return_dict.pop(i)
    if(len(return_dict) <2):
        return None
    else:
        return return_dict


def get_time(pa):
    global result_dcit
    if Path(pa).is_dir():
        total_time = []
        thread_title = re.findall(r'\d{5,7}-?(.*)$',str(pa))[0]
        for sub_pa in Path(pa).iterdir():
            total_time = total_time + find_time(sub_pa)
        result = filter_time(forum,total_time)
    else:
        thread_title = re.findall(r'\d{5,7}-\d{1,3}-?(.*).md$',str(pa))[0]
        result = filter_time(forum,find_time(pa))
    if(result):
        result_dict[forum][thread_title] = result

current_date = datetime.now().strftime("%Y%m%d")
for year in ['2023']:
    print(year+" START...")
    if year == datetime.now().strftime("%Y"):
        date_list = [pd.Timestamp(x).strftime("%Y-%-m-%-d") for x in pd.date_range(year+'0101',current_date)]
    else:
        date_list = [pd.Timestamp(x).strftime("%Y-%-m-%-d") for x in pd.date_range(year+'0101',year+'1231')]

    forum_dict ={'troll':['外野'],'game':['游戏区','手游专楼'],'anime':['漫区'],'vtb':['虚拟主播区专楼']}

    result_dict = {'troll':{},'game':{},'anime':{},'vtb':{}}
    for path in ['S1PlainTextArchive2023','S1PlainTextBackup']:
        for forum in forum_dict.keys():
            for sub_forum in forum_dict[forum]:
                for pa in Path('/home/riko/'+ path + '/'+sub_forum+'/').iterdir():
                    if '0无法访问' in str(pa):
                        for pb in Path(pa).iterdir():
                            get_time(pb)
                            print(pb)
                    else:
                        get_time(pa)
                        print(pa)
                
    mkdir('./S1A-OLD/')
    with open('./S1A-OLD/S1A-'+year+'.json', "w", encoding="utf-8") as f:
        f.write(json.dumps(result_dict,indent=2,ensure_ascii=False))
    print(year+" END\n========\n\n")
