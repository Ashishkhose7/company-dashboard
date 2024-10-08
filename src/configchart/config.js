import millify from "millify";

const documentStyle = getComputedStyle(document.documentElement);
const documentStyle2 = getComputedStyle(document.documentElement);
const textColor = documentStyle2.getPropertyValue("--p-text-color");
const textColorSecondary = documentStyle2.getPropertyValue(
  "--p-text-muted-color"
);
const surfaceBorder = documentStyle2.getPropertyValue(
  "--p-content-border-color"
);

//Price Chart
export const priceoptions = {
  responsive: true,
  stacked: false,
  maintainAspectRatio: false,
  aspectRatio: 0.6,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          let value = context.raw;
          return "Price: " + millify(value);
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },

      ticks: {
        font: {
          weight: 500,
          size: 10,
        },
        color: textColorSecondary,
      },
    },
    y: {
      type: "linear",
      display: true,
      position: "left",
      ticks: {
        callback: function (value) {
          return millify(value);
        },
        color: textColorSecondary,
      },
      grid: {
        display: false,
      },
    },
  },
};

// Market Cap - Valuation
export const capvaluationoptions = {
  maintainAspectRatio: false,
  aspectRatio: 0.8,
  plugins: {
    legend: {
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        color: textColor,
        font: {
          size: 12,
          family: "Poppins",
        },
        filter: function (item) {
          if (item.text === "Market Cap") return "Market Cap";
          if (item.text === "Valuation") return "Valuation";
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          let value = context.raw;
          return "Value: " + millify(value);
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: textColorSecondary,
        font: {
          weight: 500,
          size: 10,
        },
      },
      grid: {
        display: false,
        drawBorder: false,
      },
      categoryPercentage: 1,
      barPercentage: 1,
    },
    y: {
      ticks: {
        color: textColorSecondary,
        callback: function (value) {
          return millify(value);
        },
      },

      grid: {
        color: surfaceBorder,
        display: false,
        borderDash: [5, 5],
      },
    },
  },
};

// Debt invetsment option
export const debtoptions = {
  responsive: true,
  stacked: false,
  maintainAspectRatio: false,
  aspectRatio: 0.6,
  plugins: {
    legend: {
      labels: {
        color: textColor,
        font: {
          size: 12,
          family: "Poppins",
        },
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          let value = context.raw;
          return "Value: " + millify(value);
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },

      ticks: {
        font: {
          weight: 500,
          size: 10,
        },
        color: textColorSecondary,
      },
    },
    y: {
      type: "linear",
      display: true,
      position: "left",
      ticks: {
        callback: function (value) {
          return millify(value);
        },
        color: textColorSecondary,
      },
      grid: {
        display: true,
      },
    },
  },
};

// Expensechart option
export const expenseoptions = {
  responsive: true,
  // maintainAspectRatio: false,
  cutout: "50%", // Change this value to control the width (0% is a pie chart)
  plugins: {
    legend: {
      position: "bottom",
      display: true,
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        color: "textColorSecondary",
        font: {
          size: 11,
          family: "Poppins",
        },
        padding: 10,
        text: "center",
        boxWidth: 10,
      },
    },
    tooltip: {
      callbacks: {
        label: (tooltipItem) => {
          const total = tooltipItem.dataset.data.reduce((a, b) => a + b, 0);
          const currentValue = tooltipItem.raw;
          const percentage = ((currentValue / total) * 100).toFixed(2) + "%";
          return `${tooltipItem.label}: ${percentage}`;
        },
      },
    },
  },
};

// Revenue Income Option
export const revenueincomeoptions = {
  maintainAspectRatio: false,
  aspectRatio: 0.8,
  plugins: {
    legend: {
      labels: {
        color: textColor,
        font: {
          size: 12,
          family: "Poppins",
        },
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          let value = context.raw;
          return "Value: " + millify(value);
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: textColorSecondary,
        font: {
          weight: 500,
          size: 10,
        },
      },
      grid: {
        display: false,
        drawBorder: false,
      },
    },
    y: {
      ticks: {
        color: textColorSecondary,
        callback: function (value) {
          return millify(value);
        },
      },

      grid: {
        drawBorder: true,
        display: true,
        drawBorder: true,
        borderDash: [5, 5],
        drawOnChartArea: true,
      },
    },
  },
};

// Sector Performance Option
export const sectorperformanceoptions = {
  maintainAspectRatio: false,
  aspectRatio: 0.8,
  plugins: {
    tooltips: {
      mode: "index",
      intersect: false,
    },
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          let value = context.raw;
          return "Change: " + millify(value) + "%";
        },
      },
    },
  },
  scales: {
    x: {
      stacked: true,
      ticks: {
        color: textColorSecondary,
        display: false,
      },
      grid: {
        color: surfaceBorder,
        display: false,
      },
    },
    y: {
      stacked: true,
      ticks: {
        color: textColorSecondary,
      },
      grid: {
        display: true,
      },
    },
  },
};

// EPS options
export const epsoptions = {
  maintainAspectRatio: false,
  aspectRatio: 0.8,
  plugins: {
    legend: {
      display: false,
      labels: {
        display: false,
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          let value = context.raw;
          return "Value: " + millify(value);
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: textColorSecondary,
        font: {
          weight: 500,
          size: 10,
        },
      },
      grid: {
        display: false,
      },
    },
    y: {
      ticks: {
        color: textColorSecondary,
        callback: function (value) {
          return millify(value);
        },
      },
      grid: {
        display: true,
      },
    },
  },
};
