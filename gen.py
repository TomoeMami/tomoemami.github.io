# -*- coding: UTF-8 -*-
import json,os
from pathlib import Path
from datetime import datetime
import pandas as pd
from pyecharts import options as opts
from pyecharts.options.global_options import InitOpts, TitleOpts
from pyecharts.charts import Line

data_path = ['S1A21','S1A22','S1B']
year = '2022'
current_date = datetime.now().strftime("%Y%m%d")
date_list = [pd.Timestamp(x).strftime("%Y-%-m-%-d") for x in pd.date_range(year+'0101',current_date)]
# date_list = [pd.Timestamp(x).strftime("%Y-%-m-%-d") for x in pd.date_range(year+'0101',year+'1231')]
data_dict = {'troll':{},'game':{},'anime':{},'vtb':{}}
name_dict = {'troll':'外野','game':'游戏区','anime':'漫区','vtb':'虚拟主播区'}
'部分板块全年显示的话网页会过大需要拆分'
# data_dict = {'troll':{}}
# name_dict = {'troll':'外野'}
# data_dict = {'game':{}}
# name_dict = {'game':'游戏区'}

for data_p in data_path:
    for pa in Path('./'+data_p+'/').iterdir():
        if(year in str(pa)):
            with open(pa,'r',encoding='UTF-8') as f:
                temp_dict = json.load(f)
            # for i in data_dict.keys():
            for i in temp_dict.keys():
                data_dict[i].update(temp_dict[i])
for i in data_dict.keys():
    line = Line(init_opts=opts.InitOpts(page_title=year+'年'+name_dict[i]+"日回帖统计"))
    line.add_xaxis(xaxis_data=date_list)
    y_data = {}
    for thread in data_dict[i].keys():
        y_data[thread] = [None]*len(date_list)
        for k in data_dict[i][thread].keys():
            if(k in date_list):
               index_num = date_list.index(k)
               y_data[thread][index_num] = data_dict[i][thread][k]
        line.add_yaxis(
            series_name=thread,
            y_axis = y_data[thread],
            # stack="total",
            label_opts=opts.LabelOpts(is_show=False),
            linestyle_opts=opts.LineStyleOpts(width=1),
            # markpoint_opts=opts.MarkLineOpts(symbol_size=100),
            areastyle_opts=opts.AreaStyleOpts(opacity=0.5),
        )
    line.set_global_opts(
        title_opts=opts.TitleOpts(title=year+'年'+name_dict[i]+"回帖数"),
        tooltip_opts=opts.TooltipOpts(trigger="item"),
        yaxis_opts=opts.AxisOpts(
            type_="value",
            axistick_opts=opts.AxisTickOpts(is_show=True),
            splitline_opts=opts.SplitLineOpts(is_show=True),
        ),
        xaxis_opts=opts.AxisOpts(type_="category", boundary_gap=False),
        legend_opts=opts.LegendOpts(is_show=False),
        datazoom_opts=[
            opts.DataZoomOpts(range_start=90, range_end=100),
            opts.DataZoomOpts(
                    # is_show=True,
                    type_="inside",
                    # is_realtime=True,
                    range_start=90,
                    range_end=100,
                    # start_value=90,
                    # end_value=100,
                    # xaxis_index=[0, 1],
                )
            ],
    )
    line.render(i+'-'+year+'.html')
