// Variables
var configEmbedToken;
var configReportData;
var token;
var embedToken;
var embedUrl;
var reportID;
var dataLogin = '&grant_type=client_credentials\r\n&client_id=05a925c0-f662-490c-9cdd-f82ddcb14333\r\n&client_secret=IIV8Q~YrOmKo1Gm_jhPP6-tgdsRo7DBDjO1WZdkc\r\n&client_info=1\r\n&resource=https://analysis.windows.net/powerbi/api\r\n';
var reportType;
var dataReport;

// Imports
const express = require("express");
const app = express();
const cors = require("cors");
var axios = require('axios');
app.use(cors(corsOptions));
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));   

var configAccessToken = {
  method: 'post',
  url: 'https://login.microsoftonline.com/0d912304-28f8-4743-bc2e-b267730f2978/oauth2/token',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Chrome/108.0.0.0 Safari/537.36',
    'Cookie': 'buid=0.AToAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA.AQABAAEAAAD--DLA3VO7QrddgJg7Wevrw5yhxfw6ge3JVz0vPxb76lGDHDYOKKU21uXQWY7Psrr8aqKMTqPtilz1SlBcO1IIiWl-H4D_qtQBUKLCwqtDdJQFdUo33YoG0gKT7nZwMkkgAA; fpc=AvWTszcNgOtNuvvgyumcFHQxcQv3AQAAAMOYI9sOAAAA; stsservicecookie=estsfd; x-ms-gateway-slice=estsfd'
  },
  data: dataLogin
};
function structureDataReport(type){
  reportType = type == 1 ? 'EMBED DEMO 1' : 'EMBED DEMO 2';
  dataReport = JSON.stringify({
    "accessLevel": "View",
    "datasetId": "60e5e613-690a-4681-aa76-c21236bba0c2",
    "identities": [
      {
        "username": reportType,
        "datasets": [
          "60e5e613-690a-4681-aa76-c21236bba0c2"
        ],
        "roles": [
          "EmbeddedDynamicAll",
          "EmbeddedDynamicAir"
        ]
      }
    ]
  });
}

var corsOptions = {
  origin: "https://localhost:4200"
};

app.get(`/api/hello`, (req, res) => {
  res.json({title : 'Hello World'});
});

app.get(`/api/getToken/:id`, (req, res) => {
  axios(configAccessToken)
    .then(function (response) {
      token = response.data.access_token;
    }).then(() => {
      structureDataReport(req.params.id);
      configEmbedToken = {
        method: 'post',
        url: 'https://api.powerbi.com/v1.0/myorg/groups/32b92560-4ff6-420d-a8bd-7349a9c8fc9d/reports/cf538095-bcf6-4656-86ea-aee03646c04d/GenerateToken',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: dataReport
      };
      axios(configEmbedToken)
        .then(function (response) {
          embedToken = response.data.token;
        }).then(() => {
          console.log(embedToken);
          configReportData = {
            method: 'get',
            url: 'https://api.powerbi.com/v1.0/myorg/groups/32b92560-4ff6-420d-a8bd-7349a9c8fc9d/reports',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          };
          axios(configReportData)
            .then(function (response) {
              console.log(JSON.stringify(response.data));
              embedUrl = response.data['value'][0]['embedUrl'],
              reportID = response.data['value'][0]['id']
            }).then(()=>{
              reportsData = {
                embedToken : embedToken,
                embedUrl : embedUrl,
                reportID : reportID
              }
              res.json(reportsData);
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    })
    .catch(function (error) {
      console.log(error);
    });
});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
