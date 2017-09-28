var CLIENT_ID = '772837567857-solpkhp2he24slkkrinm595s5ujfedgp.apps.googleusercontent.com';
var API_KEY = 'AIzaSyC3l-9T7lAW9n2b4rq6nFFIhDrFJ4H3gU0';

var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

var authorizeButton = document.getElementById('authorize-button');
var signoutButton = document.getElementById('signout-button');

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        document.getElementById("content").style.display = "block";
        fetchData();
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        document.getElementById("content").style.display = "none";
    }
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
    document.getElementById("content").style.display = "none";
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
    document.getElementById("content").style.display = "none";
}

var data = [], dataDefault = [];
function fetchData() {
    document.getElementById("table-body").innerHTML = "";
    data = [], dataDefault = [];
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1WfqDI8O76xCLdV95LfAZlpE-F9oarVoMSeOtmxTyfyo',
        range: 'Country sales!A:B',
    }).then(function (response) {
        var range = response.result;
        if (range.values.length > 0) {
            for (i = 0; i < range.values.length; i++) {
                var row = range.values[i];
                data[data.length] = [];
                data[data.length - 1][0] = row[0];
                data[data.length - 1][1] = row[1];

                dataDefault[dataDefault.length] = [];
                dataDefault[dataDefault.length - 1][0] = row[0];
                dataDefault[dataDefault.length - 1][1] = 0;

                document.getElementById("table-body").innerHTML += '\
                        <tr>\
                            <td>' + row[0] + '</td>\
                            <td>' + row[1] + '</td>\
                        </tr>';
            }
            var chart = c3.generate({
                bindto: '#chart',
                data: {
                    columns: dataDefault,
                    type: 'pie',
                    onclick: function (d, i) {
                        showModal(d.name, (d.ratio * 100).toFixed(2), d.value);
                    }
                },
                pie: {
                    label: {
                        format: function (value, ratio, id) {
                            return value;
                        }
                    }
                },
                tooltip: {
                    format: {
                        value: function (value, ratio, id) {
                            return value + ' (' + (ratio * 100).toFixed(2) + '%)';
                        }
                    }
                },
                transition: {
                    duration: 1000
                }
            });
            setTimeout(function () {
                chart.load({
                    columns: data
                });
            }, 1000);
        } else {
            document.getElementById("content").innerHTML = "No data found.";
        }
    }, function (response) {
        console.error('Error: ' + response.result.error.message);
    });
}

function showModal(name, perc, value) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var countryDetails = (JSON.parse(this.responseText))[0];
            document.getElementById("countryName").innerHTML = name;
            document.getElementById("countryFlag").src = countryDetails.flag;
            document.getElementById("countryDetails").innerHTML = '\
                        Country: <span class="w3-text-grey">' + name + '</span><br />\
                        Sales: <span class="w3-text-grey">' + value + '</span><br />\
                        Sales percentage: <span class="w3-text-grey">' + perc + '%</span>';
            document.getElementById("countryInfo").style.display = "block";
        }
    }
    xhttp.open("GET", encodeURI("https://restcountries.eu/rest/v2/name/" + name), true);
    xhttp.send();
}