import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { fetchRevenueByMonth } from "../../services/admin/adminapi";


interface ChartState {
    series: ApexAxisChartSeries;
    options: ApexOptions;
}


const ApexChart: React.FC = () => {
    const [state, setState] = useState<ChartState>({
        series: [
            {
                name: "Desktops",
                data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 120, 95, 110] 
            },
        ],
        options: {
            chart: {
                height: 350,
                type: "line",
                zoom: {
                    enabled: false,
                },
            },
            dataLabels: {
                enabled: true,
            },
            stroke: {
                curve: "straight",
            },
            title: {
                text: "Revenue by Month",
                align: "left",
            },
            grid: {
                row: {
                    colors: ["#f3f3f3", "transparent"],
                    opacity: 0.5,
                },
            },
            xaxis: {
                categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            },
        },
    });

    useEffect(() => {
        const fetchRevenueDatas = async () => {
            try {
                
                const response: any = await fetchRevenueByMonth()
                const {categories, data } = response
    
                if(response.success) {
                    setState(prev => ({
                        ...prev,
                        series: [{ name: "Desktops", data }],
                        options: {
                            ...prev.options,
                            xaxis: { ...prev.options.xaxis, categories}
                        }
                    }))
                }


            } catch (error) {
                console.error(error)
            }
        }

        fetchRevenueDatas()
    }, [])

    return (
        <div>
            <div id="chart">
                <ReactApexChart
                    options={state.options}
                    series={state.series}
                    type="line"
                    height={350}
                />
            </div>
            <div id="html-dist"></div>
        </div>
    );
}

export default ApexChart