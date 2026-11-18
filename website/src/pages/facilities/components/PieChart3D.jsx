import React, { useEffect } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

const BasicPieChart = () => {
  useEffect(() => {
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create("chartdiv", am4charts.PieChart);
    chart.hiddenState.properties.opacity = 0;

    chart.data = [
      { year: "2018 - 19", placed: 180, companies: 30 },
      { year: "2019 - 20", placed: 220, companies: 40 },
      { year: "2020 - 21", placed: 160, companies: 28 },
      { year: "2021 - 22", placed: 250, companies: 55 },
      { year: "2022 - 23", placed: 400, companies: 65 },
      { year: "2023 - 24", placed: 520, companies: 75 },
      { year: "2024 - 25", placed: 600, companies: 85 },
    ];

    let series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = "placed";
    series.dataFields.category = "year";
    series.dataFields.radiusValue = "placed";

    series.slices.template.cornerRadius = 6;
    series.colors.step = 3;
    series.hiddenState.properties.endAngle = -90;

    series.slices.template.tooltipText =
      "{category}:\nStudents Placed: {value}\nCompanies Visited: {companies}";
    series.labels.template.text = "{category}";

    series.labels.template.fontSize = 14;
    series.labels.template.fill = am4core.color("#000");

    // Keep your custom adapter for tooltip (no need to change it if you like the look)
    series.labels.template.adapter.add("text", function (text, target) {
      const dataItem = target.dataItem;
      if (dataItem) {
        const year = dataItem.dataContext.year;
        const companies = dataItem.dataContext.companies;
        const placed = dataItem.dataContext.placed;
        return `${year} [/][/]
         [bold][#008000]Companies Visited: [size=18]${companies}[/][/]
[size=58]${placed} [#000080]Students Placed[/][/]
────────── `;
      }
      return text;
    });

    // chart.legend = new am4charts.Legend();

    return () => {
      chart.dispose();
    };
  }, []);

  return (
    <div>
      <style>{`
        #chartdiv {
          width: 100%;
          height: 600px;
        }
      `}</style>
      <div id="chartdiv"></div>
    </div>
  );
};

export default BasicPieChart;
