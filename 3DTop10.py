# -*- coding: utf-8 -*-
import json
from pyecharts import options as opts
from pyecharts.options.global_options import InitOpts, TitleOpts
# from pyecharts.charts import Line,Grid
from pyecharts.charts import Bar3D

import time
import os

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

namedict = {'a','b','c','h','m','v'}

if __name__ == "__main__":
    for key in namedict:
        rawdata = []
        if key != 'c':
            with open('./S1G/'+key+'-RawData.json', "r", encoding="utf-8") as f:
                thdata = json.load(f)
                rawdata = rawdata + thdata
        with open('./S1B/'+key+'-RawData.json', "r", encoding="utf-8") as f:
            thdata = json.load(f)
            rawdata = rawdata + thdata
        data = {}
        for post in rawdata:
            postintime = int(time.mktime(time.strptime(post['time'],"%Y-%m-%d %H:%M")))
            if postintime%86400 :
                postintime = postintime - postintime%86400
            posttime = time.strftime("%Y-%m-%d", time.localtime(postintime))
            if posttime not in data.keys():
                data[posttime] = {}
                data[posttime]['num'] = 1
                data[posttime]['ids'] = {}
            else:
                data[posttime]['num'] = data[posttime]['num'] +1
                data[posttime]['ids'][post['id']] = 1
        datadict = data
        data = []
        stime = []
        reply = []
        replyer = []
        for keyd in sorted(datadict.keys()):
            c = keyd
            d = datadict[keyd]['num']
            e = len(datadict[keyd]['ids'].keys())
            stime.append(c)
            reply.append(d)
            replyer.append(e)
        data.append(stime)
        data.append(reply)
        data.append(replyer)
        mkdir('./S1/')
        with open('./S1/'+key+'-Data.json', "w", encoding="utf-8") as f:
            f.write(json.dumps(data,indent=2,ensure_ascii=False))

    with open("./S1/a-Data.json", "r", encoding="utf-8") as f:
        j = json.load(f)
        astime,areply,areplyer = j
    with open("./S1/b-Data.json", "r", encoding="utf-8") as f:
        j = json.load(f)
        bstime,breply,breplyer = j
    with open("./S1/c-Data.json", "r", encoding="utf-8") as f:
        j = json.load(f)
        cstime,creply,creplyer = j
    with open("./S1/h-Data.json", "r", encoding="utf-8") as f:
        j = json.load(f)
        hstime,hreply,hreplyer = j
    with open("./S1/m-Data.json", "r", encoding="utf-8") as f:
        j = json.load(f)
        mstime,mreply,mreplyer = j
    with open("./S1/v-Data.json", "r", encoding="utf-8") as f:
        j = json.load(f)
        vstime,vreply,vreplyer = j
