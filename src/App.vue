<script setup>
import { computed, onMounted, watch } from "vue";
import { ref } from "vue";
import Select from "primevue/select";
import Chart from "primevue/chart";
import BlockUI from 'primevue/blockui';
import ProgressSpinner from 'primevue/progressspinner';

import { useChartStore } from "./stores/store";
import millify from "millify";
import moment from "moment";
import {
    priceoptions,
    capvaluationoptions,
    debtoptions,
    expenseoptions,
    revenueincomeoptions,
    sectorperformanceoptions,
    epsoptions,
} from "./configchart/config";

const companyStore = useChartStore();
const selectedCompany = ref();
const loading = ref("");
const filteredOptions = ref(["NYSE", "NASDAQ"]);
const timeframe = ref("4hour");

const API_KEY = import.meta.env.VITE_API_KEY;

const options = {
    hostname: "financialmodelingprep.com",
    port: 443,
    method: "GET",
};

onMounted(async () => {
    console.log("App mounted!");
    const path = `https://financialmodelingprep.com/api/v3/stock/list?apikey=${API_KEY}`;
    const sectorpath = `https://financialmodelingprep.com/api/v3/historical-sectors-performance?limit=20&apikey=${API_KEY}`;
    // const chartpath = `https://financialmodelingprep.com/api/v3/historical-chart/${timeframe}/AAPL?apikey=${API_KEY}`;

    try {
        companyStore.hasError = false;
        loading.value = true;
        console.log("Starting");

        const response = await fetch(path, options);
        const sector = await fetch(sectorpath, options);

        let data = await response.json();
        const sectordata = await sector.json();
        if(data && sectordata){
            data = data.filter((stock)=>{
                    if(stock.type == "stock")
                    return filteredOptions.value.includes(stock.exchangeShortName);
            })

            companyStore.setStockList(data);
            companyStore.setCompanyData(sectordata, "sector");
            console.log("Finished");
            loading.value = false;
            
        }else{
            companyStore.hasError = true;
            console.log("Gotcha!");
            
        }
        } catch (error) {
            companyStore.hasError = true;
            console.log(error);
    }
});


  watch(timeframe, async (newTimeFrame)=>{
    companyStore.hasError = false
    loading.value = true;
    
    const chartpath = `https://financialmodelingprep.com/api/v3/historical-chart/${newTimeFrame}/${companyStore.getCompanyProfile[0].symbol}?apikey=${API_KEY}`;
    try {
        loading.value = true;
        const chart = await fetch(chartpath, options);

        const chartdata = await chart.json();

        companyStore.setCompanyData(chartdata, "chart");

        loading.value = false;

    } catch (error) {
        companyStore.hasError = true
        console.log(error);
    }

  })

  watch(selectedCompany, async (newVal)=>{
    companyStore.hasError = false;
    loading.value = true;

    const chartpath = `https://financialmodelingprep.com/api/v3/historical-chart/${timeframe.value}/${newVal.symbol}?apikey=${API_KEY}`;

    const profilepath = `https://financialmodelingprep.com/api/v3/profile/${newVal.symbol}?apikey=${API_KEY}`;

    const incomestatementpath = `https://financialmodelingprep.com/api/v3/income-statement/${newVal.symbol}?period=annual&apikey=${API_KEY}`;

    const balancestatementpath = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${newVal.symbol}?period=annual&apikey=${API_KEY}`;

    const metricspath = `https://financialmodelingprep.com/api/v3/key-metrics/${newVal.symbol}?limit=100period=annual&apikey=${API_KEY}`;
    
    try {
        loading.value = true;
        
        const profile = await fetch(profilepath, options);
        const income = await fetch(incomestatementpath, options);
        const balance = await fetch(balancestatementpath, options);
        const metrics = await fetch(metricspath, options);
        const chart = await fetch(chartpath, options);

        
        const profiledata = await profile.json();
        const incomedata = await income.json();
        const balancedata = await balance.json();
        const metricsdata = await metrics.json();
        const chartdata = await chart.json();

        companyStore.setCompanyData(profiledata, "profile");
        companyStore.setCompanyData(incomedata, "income");
        companyStore.setCompanyData(balancedata, "balance");
        companyStore.setCompanyData(metricsdata, "metrics");
        companyStore.setCompanyData(chartdata, "chart");
       
        loading.value = false;

    } catch (error) {
        companyStore.hasError = true;
        console.log(error);
    }
  })

//   Chart style and configuration
const documentStyle = getComputedStyle(document.documentElement);
const documentStyle2 = getComputedStyle(document.documentElement);
const textColor = documentStyle2.getPropertyValue("--p-text-color");
const textColorSecondary = documentStyle2.getPropertyValue(
    "--p-text-muted-color"
);
const surfaceBorder = documentStyle2.getPropertyValue(
    "--p-content-border-color"
);

//   Debt - Investment chart
const debtchart = ref("");
const debtinvestmentsdata = computed(() => {
    const investmentschartdata = companyStore.getBalanceStatement.map(
        (data) => data.totalInvestments
    );
    const debtchartdata = companyStore.getBalanceStatement.map(
        (data) => data.totalDebt
    );
    const debtinvestlabel = companyStore.getBalanceStatement.map((data) =>
        moment(data.date).format("YYYY")
    );
    return (debtchart.value = {
        labels: debtinvestlabel.reverse(),
        datasets: [
            {
                label: "Debt",
                data: investmentschartdata.reverse(),
                fill: false,
                borderColor: "rgb(79 70 229 )",
                tension: 0.4,
                borderWidth: 1.4,
                pointRadius: 2.5,
                pointHoverRadius: 5,
                backgroundColor: "rgb(79 70 229 )",
                pointBackgroundColor: "rgb(79 70 229 )",
            },
            {
                label: "Investment",
                data: debtchartdata.reverse(),
                fill: false,
                borderColor: "rgb(249 115 22)",
                tension: 0.4,
                borderWidth: 1.4,
                pointRadius: 2.5,
                pointHoverRadius: 5,
                backgroundColor: "rgb(249 115 22)",
                pointBackgroundColor: "rgb(249 115 22)",
            },
        ],
    });
});

//   Expense Chart
const expensechart = ref("");
const expensedata = computed(() => {
    const expensechartdata = [
        companyStore.getIncomeStatement[0]["researchAndDevelopmentExpenses"],
        companyStore.getIncomeStatement[0]["generalAndAdministrativeExpenses"],
        companyStore.getIncomeStatement[0]["sellingAndMarketingExpenses"],
        companyStore.getIncomeStatement[0]["operatingExpenses"],
        companyStore.getIncomeStatement[0]["otherExpenses"],
    ];
    return (expensechart.value = {
        labels: ["R&D ", "Admin ", "Sells & Marketing ", "Operating ", "Other "],
        datasets: [
            {
                data: expensechartdata,
                backgroundColor: [
                    "rgb(153, 50, 204)",
                    "rgb(100, 181, 246)",
                    "rgb(220, 20, 60)",
                    "rgb(255, 127, 80)",
                    "rgba(103, 126, 154)",
                ],
                hoverBackgroundColor: [
                    "rgb(153, 50, 204, 0.5)",
                    "rgb(100, 181, 246, 0.5)",
                    "rgb(220, 20, 60, 0.5)",
                    "rgb(255, 127, 80, 0.5)",
                    "rgb(103, 126, 154, 0.5)",
                ],
                borderWidth: 0.3,
            },
        ],
    });
});

// Revenue - Income Chart
const revenueincomechart = ref("");
const revenueincomedata = computed(() => {
    const revenuechartdata = companyStore.getIncomeStatement.map(
        (data) => data.revenue
    );
    const netincomechartdata = companyStore.getIncomeStatement.map(
        (data) => data.netIncome
    );
    const labeldate = companyStore.getIncomeStatement.map((data) =>
        moment(data.date).format("YYYY")
    );
    return (revenueincomechart.value = {
        labels: labeldate.reverse(),
        datasets: [
            {
                label: "Revenue",
                tension: 0.4,
                borderWidth: 0,
                borderSkipped: false,
                maxBarThickness: 18,
                backgroundColor: "darkorchid",
                borderColor: documentStyle.getPropertyValue("--p-cyan-500"),
                data: revenuechartdata.reverse(),
            },
            {
                label: "Net Income",
                tension: 0.4,
                borderWidth: 0,
                borderSkipped: false,
                maxBarThickness: 18,
                backgroundColor: "crimson",
                borderColor: documentStyle.getPropertyValue("--p-gray-500"),
                data: netincomechartdata.reverse(),
            },
        ],
    });
});

// Sector Performance
const sectorperformance = ref("");
const sectorperformancedata = computed(() => {
    const sectorName = companyStore.getCompanyProfile[0].sector;
    
    const toCamelCase = (str) => {
        return (
            str
                .split(" ")
                .map((word, index) => {
                    if (index === 0) {
                        return word.toLowerCase(); // First word in lowercase
                    }
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); // Subsequent words capitalized
                })
                .join("") + "ChangesPercentage"
        ); // Append 'ChangesPercentage'
    };

    const propertyName = toCamelCase(sectorName);

    const sectorperformancechartdata = companyStore.getSectorPerformance.map(
        (data) => data[propertyName]
    );

    const sectordate = companyStore.getSectorPerformance.map((data) =>
        moment(data.date).format("DD-MMM-YYYY")
    );
    const backgroundColors = companyStore.getSectorPerformance.map((value) =>
        value[propertyName] >= 0 ? "MediumSeaGreen" : "red"
    ); // Green for positive, red for negative

    return (sectorperformance.value = {
        labels: sectordate.reverse(),
        datasets: [
            {
                type: "line",
                label: false,
                borderColor: "lightgray",
                borderWidth: 1.5,
                fill: true,
                pointRadius: 1,
                tension: 0.4,
                data: sectorperformancechartdata.reverse(),
            },
            {
                label: "Sector Changes",
                type: "bar",
                fill: true,
                tension: 0.4,
                borderWidth: 0,
                maxBarThickness: 4,
                borderWidth: 0,
                borderSkipped: false,
                backgroundColor: backgroundColors.reverse(),
                fill: true,
                data: sectorperformancechartdata,
            },
        ],
    });
});

// Eps Chart
const epschart = ref("");
const epsdata = computed(() => {
    const epschartdata = companyStore.getIncomeStatement.map((data) => data.eps);
    const epslabel = companyStore.getIncomeStatement.map((data) =>
        moment(data.date).format("YYYY")
    );
    return (epschart.value = {
        labels: epslabel.reverse(),
        datasets: [
            {
                label: "Revenue",
                tension: 0.4,
                borderWidth: 0,
                // borderRadius: {
                //      topLeft: 4,
                //      topRight: 4                        },
                borderSkipped: false,
                maxBarThickness: 10,
                backgroundColor: "rgb(79 70 229 )",
                borderColor: documentStyle.getPropertyValue("--p-cyan-500"),
                data: epschartdata.reverse(),
            },
        ],
    });
});

// PE Ratio Chart
const ebidtachart = ref("");
const ebidtadata = computed(() => {
    const epslabel = companyStore.getIncomeStatement.map((data) =>
        moment(data.date).format("YYYY")
    );
    const ebidtachartdata = companyStore.getKeyMetrics.map(
        (data) => data.peRatio
    );
    return (ebidtachart.value = {
        labels: epslabel,
        datasets: [
            {
                label: "Revenue",
                tension: 0.4,
                borderWidth: 0,
                // borderRadius: {
                //      topLeft: 4,
                //      topRight: 4                        },
                borderSkipped: false,
                maxBarThickness: 10,
                backgroundColor: "rgb(249 115 22)",
                data: ebidtachartdata.reverse(),
            },
        ],
    });
});

// Market Cap - Valuation
const capvaluationchart = ref("");
const capvaluationdata = computed(() => {
    const capchartdata = companyStore.getKeyMetrics.map((data) => data.marketCap);
    const valuationchartdata = companyStore.getKeyMetrics.map(
        (data) => data.enterpriseValue
    );
    const capvaluationlabel = companyStore.getKeyMetrics.map((data) =>
        moment(data.date).format("YYYY")
    );
    return (capvaluationchart.value = {
        labels: capvaluationlabel.reverse(),
        datasets: [
            // {
            //     type: 'line',
            //     label: false,
            //     borderColor: 'lightgray',
            //     borderWidth: 1,
            //     fill: false,
            //     pointRadius: 1,
            //     tension: 0.4,
            //     data: valuationchartdata.reverse()
            // },
            {
                label: "Market Cap",
                tension: 0.4,
                borderWidth: 0,
                borderRadius: {
                    topLeft: 4,
                    topRight: 4,
                },
                borderSkipped: false,
                maxBarThickness: 6,
                barThickness: 10,
                // backgroundColor: 'rgb(249 115 22)',
                backgroundColor: "crimson",
                data: capchartdata.reverse(),
            },
            {
                label: "Valuation",
                tension: 0.4,
                borderWidth: 0,
                borderRadius: {
                    topLeft: 5,
                    topRight: 5,
                },
                borderSkipped: false,
                maxBarThickness: 6,
                barThickness: 10,
                // backgroundColor: 'rgb(79 70 229 )',
                backgroundColor: "darkorchid",
                data: valuationchartdata.reverse(),
            },
        ],
    });
});

//Price Chart
const pricechart = ref("");
const pricesdata = computed(() => {
    const pricechartdata = companyStore.getChart.slice(0, 20).map((data) => data.close);
    const pricelabel = companyStore.getChart.slice(0, 20).map((data) =>
        moment(data.date).format("LT")
    );
    const getGradient = (ctx, chartArea) => {
        const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
        );
        gradient.addColorStop(0, "rgb(50, 205, 50, 0.8)"); // Dark color at the top
        gradient.addColorStop(1, "rgb(50, 205, 50, 0.1)"); // Light color at the bottom
        return gradient;
    };
    const pointRadius = companyStore.getChart.slice(0, 20).map((value, index) =>
        index === companyStore.getChart.slice(0, 20).length - 1 ? 4 : 0
    );
    return (pricechart.value = {
        labels: pricelabel.reverse(),
        datasets: [
            {
                data: pricechartdata.reverse(),
                fill: true,
                borderColor: "LawnGreen",
                tension: 0.4,
                borderWidth: 2,
                pointHoverRadius: 5,
                pointBackgroundColor: "LawnGreen",
                pointRadius: pointRadius,
                backgroundColor: function (context) {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) {
                        return null;
                    }
                    return getGradient(ctx, chartArea);
                },
            },
        ],
    });
});

const isError = computed(()=>{
    return companyStore.getError;
})

// const isLoading = computed(()=>{
//     return companyStore.getIsLoading;
// })

</script>

<template>
    <main class="bg-gray-100">
        <div v-if="isError" class="loading-message text-white">
            <span class="flex items-center gap-3">
                <!-- <img src="https://www.svgrepo.com/show/507688/face-id-error.svg" alt=""height="30" width="30"> -->
                Something went wrong... 
            </span>
            <span class="text-sm block mt-2">Try again later</span>
        </div>
        <div v-else-if="loading" class="loading-message text-white">
            <span class="flex items-center gap-3">
                <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="6" fill="transparent"
                 animationDuration=".5s"/>
            </span>
        </div>
        <BlockUI :blocked="isError" title="Error">
        <BlockUI :blocked="loading" title="Loading">
        
        <div class="flex min-h-screen">
            <!-- Sidebar -->
            <aside class="w-16 bg-indigo-600 text-white flex flex-col items-center py-4 space-y-6">
                <div class="w-8 h-8 bg-white rounded-full"></div>
                <i class="fas fa-home text-2xl"></i>
                <i class="fas fa-comment-alt text-2xl"></i>
                <i class="fas fa-star text-2xl"></i>
                <i class="fas fa-cog text-2xl"></i>
            </aside>

            <!-- Main content -->
            <main class="flex w-[100%] justify-between p-6">
                <div class="w-[74%] flex flex-wrap gap-6 justify-between">
                    <!-- Top left stats -->
                    <div class="w-[68%] grid grid-col-1 gap-6">
                        <div class="h-[300px] col-span-2 bg-white rounded-2xl py-4 pl-4 pr-1 shadow">
                            <div class="flex justify-between items-center mb-4 mr-4">
                                <h2 class="text-lg font-semibold">Chart</h2>
                                <select v-model="timeframe" class="border rounded px-2 py-1 text-sm">
                                    <option value="1min">1 Min</option>
                                    <option value="5min">5 Min</option>
                                    <option value="15min">15 Min</option>
                                    <option value="30min">30 Min</option>
                                    <option value="1hour">1 Hour</option>
                                    <option value="4hour">4 Hour</option>
                                </select>
                            </div>
                            <div class="space-y-4 h-[230px]">
                                <Chart type="line" :data="pricesdata" :options="priceoptions" class="h-[100%]" />
                            </div>
                        </div>

                        <!-- PE Ratio Chart -->
                        <div class="min-w-[300px] bg-white rounded-2xl p-4 shadow">
                            <h2 class="text-lg font-semibold mb-3">PE Ratio</h2>
                            <div class="h-52">
                                <Chart type="bar" :data="ebidtadata" :options="epsoptions" class="h-[100%]" />
                            </div>
                        </div>

                        <!-- EPS Chart -->
                        <div class="min-w-[300px] bg-white rounded-2xl p-4 shadow">
                            <h2 class="text-lg font-semibold mb-3">EPS</h2>
                            <div class="h-52">
                                <Chart type="bar" :data="epsdata" :options="epsoptions" class="h-[100%]" />
                            </div>
                        </div>
                    </div>

                    <!-- top-right -->
                    <div class="w-[29%] flex flex-col gap-6 top-right">
                        <div class="h-[180px] bg-white rounded-2xl p-4 shadow">
                            <h2 class="text-lg font-semibold mb-4 inline-block">Profile</h2>
                            <img :src="companyStore.getCompanyProfile[0].image" alt=""
                                class="inline-block rounded-lg float-right h-[35px] w-[35px] bg-black" />
                            <!-- Chart placeholder -->
                            <div class="h-30 text-sm overflow-hidden rounded">
                                <span class="font-bold text-base companydetails">{{
                                    companyStore.getCompanyProfile[0].companyName
                                    }}</span>
                                <br />
                                <span class="inline-block my-4 text-slate-600">Price:</span><span
                                    class="inline-block float-right my-4 text-slate-600">${{
                                    companyStore.getCompanyProfile[0].price }}</span>
                                <br />
                                <span class="inline-block text-slate-600">Market Cap:</span><span
                                    class="inline-block float-right text-slate-600">{{
                                        millify(companyStore.getCompanyProfile[0].mktCap)
                                    }}</span>
                            </div>
                        </div>

                        <div class="h-[400px] flex flex-col bg-white rounded-2xl p-4 shadow">
                            <h2 class="text-lg font-semibold mb-4">Expenses</h2>
                            <!-- Chart placeholder -->
                            <div class="h-full card rounded flex items-center justify-center px-3 mx-3">
                                <Chart type="doughnut" :data="expensedata" :options="expenseoptions"
                                    class="w-full md:w-[18rem]" />
                            </div>
                        </div>
                    </div>

                    <!-- Area charts -->
                    <div class="flex-1 bg-white rounded-2xl p-4 shadow">
                        <h2 class="text-lg font-semibold mb-4">Revenue - Net Income</h2>
                        <!-- Area charts placeholder -->
                        <div class="h-48 rounded">
                            <Chart type="bar" :data="revenueincomedata" :options="revenueincomeoptions"
                                class="h-[100%]" />
                        </div>
                    </div>

                    <!-- Bar chart -->
                    <div class="flex-1 bg-white rounded-2xl p-4 shadow">
                        <h2 class="text-lg font-semibold mb-4">Debt - Investment</h2>
                        <!-- Bar chart placeholder -->
                        <div class="h-48">
                            <Chart type="line" :data="debtinvestmentsdata" :options="debtoptions" class="h-[100%]" />
                        </div>
                    </div>
                </div>

                <!-- main right search -->
                <div class="w-[24%] flex flex-col gap-6">
                    <div class="bg-white rounded-2xl p-4 shadow">
                        <div class="">
                            <Select v-model="selectedCompany" :options="companyStore.getStockList" filter
                                optionLabel="name" placeholder="Select a City" class="w-full" :style="null"
                                :virtualScroll="true" :virtualScrollerOptions="{ itemSize: 38, delay: 200 }"
                                :loading="loading">
                                <template #value="slotProps">
                                    <div v-if="slotProps.value" class="flex items-center">
                                        <div>
                                            {{ slotProps.value.name }} ({{
                                                slotProps.value.symbol
                                            }}/{{ slotProps.value.exchangeShortName }})
                                        </div>
                                    </div>
                                    <span v-else>
                                        {{ slotProps.placeholder }}
                                    </span>
                                </template>
                                <template #option="slotProps">
                                    <div class="flex items-center">
                                        <div>
                                            {{ slotProps.option.name }} ({{
                                                slotProps.option.symbol
                                            }}/{{ slotProps.option.exchangeShortName }})
                                        </div>
                                    </div>
                                </template>
                            </Select>
                        </div>
                    </div>

                    <!-- Chart -->
                    <div class="h-[165px] grow bg-white rounded-2xl p-4 shadow">
                        <h2 class="text-lg font-semibold mb-4">Today</h2>
                        <!-- Chart placeholder -->
                        <div class="grid grid-cols-2 gap-y-9 gap-x-5">
                            <div>
                                <div class="flex items-center">
                                    <span class="text-green-500 text-2xl font-bold mr-2">↑</span>
                                    <span class="text-2xl font-bold">{{
                                        companyStore?.getChart[0]?.high
                                        }}</span>
                                </div>
                                <p class="text-gray-500 text-sm m-0 p-0">Today's High</p>
                            </div>
                            <div class="">
                                <div class="flex items-center">
                                    <span class="text-orange-500 text-2xl font-bold mr-2">↓</span>
                                    <span class="text-2xl font-bold">{{
                                        companyStore?.getChart[0]?.low
                                        }}</span>
                                </div>
                                <p class="text-gray-500 text-sm m-0 p-0">Today's Low</p>
                            </div>
                            <div class="ml-3">
                                <div class="flex items-center">
                                    <span class="text-2xl font-bold">{{
                                        companyStore?.getChart[0]?.open
                                        }}</span>
                                </div>
                                <p class="text-gray-500 text-sm m-0 p-0">Open</p>
                            </div>
                            <div class="ml-3">
                                <div class="flex items-center">
                                    <span class="text-2xl font-bold">{{
                                        companyStore?.getChart[0]?.close
                                        }}</span>
                                </div>
                                <p class="text-gray-500 text-sm m-0 p-0">Close</p>
                            </div>
                        </div>
                    </div>

                    <!-- Progress bars -->
                    <div class="h-[150px] grow bg-white rounded-2xl p-4 shadow">
                        <h2 class="text-lg font-semibold inline-block">Sector Performance</h2>
                        <span class="text-xs text-slate-500 block"> {{companyStore.getCompanyProfile[0].sector}}</span>
                        <div class="h-32 mt-2">
                            <Chart type="line" :data="sectorperformancedata" :options="sectorperformanceoptions"
                                class="h-full" />
                        </div>
                    </div>

                    <div class="h-[250px] grow bg-white rounded-2xl p-4 shadow">
                        <h2 class="text-lg font-semibold mb-4">Market Cap</h2>
                        <!-- Chart placeholder -->
                        <div class="h-60">
                            <Chart type="bar" :data="capvaluationdata" :options="capvaluationoptions"
                                class="h-[100%]" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
        </BlockUI>
        </BlockUI>
    </main>
</template>

<style scoped></style>
