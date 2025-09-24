module.exports = {
  default: {
    require: [
      "ts-node/register",
      "src/MAP/implementation/**/*.steps.ts",
      "tests/global-setup.ts",
    ],
    format: [
      "progress-bar",
      "json:reports/cucumber.json",
      "html:reports/cucumber-report.html",
      "allure-cucumberjs:allure-results",
    ],
    formatOptions: {
      snippetInterface: "async-await",
    },
    paths: ["src/MAP/features/**/*.feature"],
    parallel: 1,
    retry: 0,
    timeout: 60000,
    worldParameters: {
      baseUrl:
        process.env.BASE_URL || "http://hpx-up1.app.inmu.qc.zycus.local:39405",
    },
  },
};
