# -*- coding: utf-8 -*-
import json
from pyecharts import options as opts
from pyecharts.options.global_options import InitOpts, TitleOpts
from pyecharts.charts import Line,Grid
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
    # timeline1 = astime + bstime + cstime + hstime + mstime + vstime
    # timeline1 = list(set(timeline1))
    # timeline = sorted(timeline1)

    vstime.insert(884,'2020-07-16')
    vreply.insert(884,0)
    vreplyer.insert(884,0)
    #V综缺少该日数据

    for day in vstime:
        if day not in astime:
            areply.insert(0,0)
            areplyer.insert(0,0)
        if day not in bstime:
            breply.insert(0,0)
            breplyer.insert(0,0)
        if day not in cstime:
            creply.insert(0,0)
            creplyer.insert(0,0)
        if day not in mstime:
            mreply.insert(0,0)
            mreplyer.insert(0,0)
        if day not in hstime:
            hreply.insert(0,0)
            hreplyer.insert(0,0)
        # if day not in vstime:
        #     vreply.insert(0,0)
        #     vreplyer.insert(0,0)

    l1 = (
        Line()
        .add_xaxis(xaxis_data=vstime)
        .add_yaxis(
            series_name="A综",
            y_axis=areply,
            areastyle_opts=opts.AreaStyleOpts(opacity=0.3),
            linestyle_opts=opts.LineStyleOpts(width=0.5),
            label_opts=opts.LabelOpts(is_show=False),
        )
        .add_yaxis(
            series_name="B综",
            y_axis=breply,
            areastyle_opts=opts.AreaStyleOpts(opacity=0.3),
            linestyle_opts=opts.LineStyleOpts(width=0.5),
            label_opts=opts.LabelOpts(is_show=False),
        )
        .add_yaxis(
            series_name="C综",
            y_axis=creply,
            areastyle_opts=opts.AreaStyleOpts(opacity=0.3),
            linestyle_opts=opts.LineStyleOpts(width=0.5),
            label_opts=opts.LabelOpts(is_show=False),
        )
        .add_yaxis(
            series_name="H综",
            y_axis=hreply,
            areastyle_opts=opts.AreaStyleOpts(opacity=0.3),
            linestyle_opts=opts.LineStyleOpts(width=0.5),
            label_opts=opts.LabelOpts(is_show=False),
        )
        .add_yaxis(
            series_name="M综",
            y_axis=mreply,
            areastyle_opts=opts.AreaStyleOpts(opacity=0.3),
            linestyle_opts=opts.LineStyleOpts(width=0.5),
            label_opts=opts.LabelOpts(is_show=False),
        )
        .add_yaxis(
            series_name="V综",
            y_axis=vreply,
            areastyle_opts=opts.AreaStyleOpts(opacity=0.3),
            linestyle_opts=opts.LineStyleOpts(width=0.5),
            label_opts=opts.LabelOpts(is_show=False),
        )
        .set_global_opts(
            title_opts=opts.TitleOpts(
                title="回帖数和回帖人数关系图", subtitle="以天为单位", pos_left="center"
            ),
            tooltip_opts=opts.TooltipOpts(trigger="item"),
            axispointer_opts=opts.AxisPointerOpts(
                is_show=True, link=[{"xAxisIndex": "all"}]
            ),
            datazoom_opts=[
                opts.DataZoomOpts(
                    is_show=True,
                    is_realtime=True,
                    range_start=97,
                    range_end=100,
                    # start_value=90,
                    # end_value=100,
                    xaxis_index=[0, 1],
                )
            ],
            xaxis_opts=opts.AxisOpts(
                grid_index=0,
                type_="category",
                boundary_gap=False,
                axisline_opts=opts.AxisLineOpts(is_on_zero=True),
                # position="top",
            ),
            yaxis_opts=opts.AxisOpts( name="回帖数"),
            legend_opts=opts.LegendOpts(pos_left="2%"),
        )
    )

    l2=(
        Line()
        .add_xaxis(xaxis_data=vstime)
        .add_yaxis(
            series_name="A综",
            y_axis=areplyer,
            areastyle_opts=opts.AreaStyleOpts(opacity=0.3),
            linestyle_opts=opts.LineStyleOpts(width=0.5),
            label_opts=opts.LabelOpts(is_show=False),
        )
        .add_yaxis(
            series_name="B综",
            y_axis=breplyer,
            areastyle_opts=opts.AreaStyleOpts(opacity=0.3),
            linestyle_opts=opts.LineStyleOpts(width=0.5),
            label_opts=opts.LabelOpts(is_show=False),
        )
        .add_yaxis(
            series_name="C综",
            y_axis=creplyer,
            areastyle_opts=opts.AreaStyleOpts(opacity=0.3),
            linestyle_opts=opts.LineStyleOpts(width=0.5),
            label_opts=opts.LabelOpts(is_show=False),
        )
        .add_yaxis(
            series_name="H综",
            y_axis=hreplyer,
            areastyle_opts=opts.AreaStyleOpts(opacity=0.3),
            linestyle_opts=opts.LineStyleOpts(width=0.5),
            label_opts=opts.LabelOpts(is_show=False),
        )
        .add_yaxis(
            series_name="M综",
            y_axis=mreplyer,
            areastyle_opts=opts.AreaStyleOpts(opacity=0.3),
            linestyle_opts=opts.LineStyleOpts(width=0.5),
            label_opts=opts.LabelOpts(is_show=False),
        )
        .add_yaxis(
            series_name="V综",
            y_axis=vreplyer,
            areastyle_opts=opts.AreaStyleOpts(opacity=0.3),
            linestyle_opts=opts.LineStyleOpts(width=0.5),
            label_opts=opts.LabelOpts(is_show=False),
        )
        .set_global_opts(
            axispointer_opts=opts.AxisPointerOpts(
                is_show=True, link=[{"xAxisIndex": "all"}]
            ),
            tooltip_opts=opts.TooltipOpts(trigger="axis"),
            xaxis_opts=opts.AxisOpts(
                grid_index=1,
                type_="category",
                boundary_gap=False,
                axisline_opts=opts.AxisLineOpts(is_on_zero=True),
                position="top",
            ),
            datazoom_opts=[
                opts.DataZoomOpts(
                    is_show=True,
                    type_="inside",
                    # is_realtime=True,
                    range_start=97,
                    range_end=100,
                    # start_value=90,
                    # end_value=100,
                    xaxis_index=[0, 1],
                )
            ],
            yaxis_opts=opts.AxisOpts(is_inverse=True, name="回帖人数"),
            legend_opts=opts.LegendOpts(is_show=False),
        )
    )
    (
        Grid(init_opts=opts.InitOpts(width="1024px", height="768px",page_title="V区专楼日回帖及回帖人数统计"))
        .add(chart=l1, grid_opts=opts.GridOpts(pos_left=50, pos_right=50, height="35%"))
        .add(
            chart=l2, grid_opts=opts.GridOpts(pos_left=50, pos_right=50, pos_top="55%", height="35%"),
        )
        .render("index.html")
        )
