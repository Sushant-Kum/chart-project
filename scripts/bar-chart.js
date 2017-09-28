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

var data = {};
data.empName = [];
data.presentDays = ["Present Days"];
data.presentDaysDefault = ["Present Days"];
data.absentDays = ["Absent Days"];
data.absentDaysDefault = ["Absent Days"];
function fetchData() {
    document.getElementById("table-body").innerHTML = "";
    data = {};
    data.empName = [];
    data.presentDays = ["Present Days"];
    data.presentDaysDefault = ["Present Days"];
    data.absentDays = ["Absent Days"];
    data.absentDaysDefault = ["Absent Days"];

    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1WfqDI8O76xCLdV95LfAZlpE-F9oarVoMSeOtmxTyfyo',
        range: 'Employee attendance!A:C',
    }).then(function (response) {
        var range = response.result;
        if (range.values.length > 0) {
            for (i = 0; i < range.values.length; i++) {
                var row = range.values[i];
                data.empName[data.empName.length] = row[0];
                data.absentDays[data.absentDays.length] = row[2];
                data.absentDaysDefault[data.absentDaysDefault.length] = 0;
                data.presentDays[data.presentDays.length] = row[1] - row[2];
                data.presentDaysDefault[data.presentDaysDefault.length] = 0;
                document.getElementById("table-body").innerHTML += '\
                <tr>\
                    <td>' + row[0] + '</td>\
                    <td>' + (row[1] - row[2]) + '</td>\
                    <td>' + row[2] + '</td>\
                    <td>' + row[1] + '</td>\
                </tr>';
            }
            var chart = c3.generate({
                bindto: '#chart',
                data: {
                    columns: [
                        data.absentDaysDefault,
                        data.presentDaysDefault
                    ],
                    type: 'bar',
                    groups: [
                        ["Absent Days", "Present Days"]
                    ]
                },
                bar: {
                    width: {
                        ratio: 0.4
                    }
                },
                grid: {
                    y: {
                        lines: [{ value: 0 }]
                    }
                },
                axis: {
                    x: {
                        type: 'category',
                        categories: data.empName,
                        label: {
                            text: 'Employees',
                            position: 'outer-right'
                        }
                    },
                    y: {
                        label: {
                            text: 'Days',
                            position: 'outer-top'
                        }
                    }
                },
                color: {
                    pattern: ['#F44336', '#009688']
                },
                transition: {
                    duration: 1000
                }
            });
            setTimeout(function () {
                chart.load({
                    columns: [
                        data.absentDays,
                        data.presentDays
                    ]
                });
            }, 1000);
        } else {
            document.getElementById("content").innerHTML = "No data found.";
        }
    }, function (response) {
        console.error('Error: ' + response.result.error.message);
    });
}