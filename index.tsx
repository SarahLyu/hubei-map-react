import * as echarts from 'echarts';
import ReactECharts from 'echarts-for-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import hubeiGeo from './hubei';

const defaultStyle = {
  label: {
    show: true,
    color: '#333',
    fontWeight: 'normal',
    fontSize: 12,
  },
  itemStyle: {
    areaColor: '#e8f4f8',
    borderColor: '#fff',
    borderWidth: 1.5,
  },
};

const highLightStyle = {
  label: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemStyle: {
    areaColor: '#1890ff',
    // borderColor: '#096dd9',
    // borderWidth: 2,
    // shadowBlur: 0,
    // shadowColor: 'rgba(9, 109, 217, 0.6)',
  },
};

const HubeiMap: React.FC = () => {
  const cityName = '湖北';
  const domId = '湖北';
  // 当前选中的城市
  const [activeCity, setActiveCity] = useState<string>('');

  // 提取城市列表
  const cityList = useMemo(() => {
    if (hubeiGeo.features && Array.isArray(hubeiGeo.features)) {
      return hubeiGeo.features.map((f: any) => f.properties?.name || f.name).filter(Boolean);
    }
    return [];
  }, []);

  // 注册地图
  useEffect(() => {
    echarts.registerMap(cityName, hubeiGeo);
  }, []);

  const renderTooltip = useCallback((params: any) => <div style={{ padding: '4px 8px' }}>${params.name}</div>, []);

  // 动态生成option
  const chartOption = useMemo(() => {
    // 选中城市蓝色高亮，其他默认
    const regionsConfig = cityList.map((city: string) => ({
      name: city,
      ...(city === activeCity ? highLightStyle : defaultStyle),
    }));

    return {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove|click',
        showDelay: 0,
        hideDelay: 100,
        // 调试模式：始终显示悬浮窗
        alwaysShowContent: true,
        // 悬浮窗内容
        formatter: renderTooltip,
        // 允许鼠标移入悬浮窗（避免误隐藏）
        enterable: true,
        // 去掉默认样式
        backgroundColor: 'transparent',
        padding: 0,
        borderWidth: 0,
        boxShadow: 'unset',
        shadowColor: 'transparent',
        // 悬浮窗居中偏下20px定位
        position: (point: number[], params: any, dom: HTMLElement, _rect: any, size: any) => {
          const cityCenter = params.data?.coord || params.event?.coord || point;
          const targetX = cityCenter[0];
          const targetY = cityCenter[1] + 20;
          return [
            Math.max(10, Math.min(size.viewSize[0] - dom.offsetWidth - 10, targetX)),
            Math.max(10, Math.min(size.viewSize[1] - dom.offsetHeight - 10, targetY)),
          ];
        },
      },
      title: [
        {
          // show: false,
          text: cityName,
          textStyle: { color: '#000', fontSize: 18 },
          subtext: `${cityName}地图演示`,
          subtextStyle: { color: '#aaa', fontSize: 12 },
          top: '20px',
          left: '20px',
        },
      ],
      legend: [{ selectedMode: 'multiple', top: 'top', orient: 'horizontal', data: [''], left: 'center', show: true }],
      backgroundColor: '#fff',
      xAxis: { show: false },
      yAxis: { show: false },
      geo: {
        map: cityName,
        // 禁止拖拽
        roam: false,
        // 禁用内置选中样式
        selectedMode: false,
        ...defaultStyle,
        // 鼠标悬浮样式
        emphasis: highLightStyle,
        regions: regionsConfig,
      },
      series: [
        {
          type: 'map',
          geoIndex: 0,
          data: cityData,
          // 禁用点击后的选中状态（防止黄色残留）
          select: {
            disabled: true,
          },
        },
      ],
    };
  }, [cityList, renderTooltip, activeCity]);

  // 点击事件
  const chartEvents = useMemo(
    () => ({
      click: (params: any) => {
        if (params.componentType === 'geo' && params.name) {
          setActiveCity(params.name);
        }
      },
    }),
    []
  );

  return (
    <div style={{ width: '1200px', height: '900px', backgroundColor: '#eee' }}>
      <ReactECharts
        id={domId}
        echarts={echarts}
        option={chartOption}
        onEvents={chartEvents}
        style={{ width: '100%', height: '100%', backgroundColor: '#fff' }}
      />
    </div>
  );
};

export default HubeiMap;
