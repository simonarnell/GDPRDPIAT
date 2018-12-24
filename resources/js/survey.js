Survey.defaultBootstrapCss.navigationButton = "btn btn-primary";
Survey.Survey.cssType = "bootstrap";

$(document).ready(function() {
  $.getJSON("resources/data/questions.json", function(json) {
    var survey = new Survey.Model(json)
    $("#dpiat").Survey({
      model: survey,
      onComplete: sendDataToServer
    });
  });
})

function sendDataToServer(survey) {
  var resultAsString = JSON.stringify(survey.data);
  alert(resultAsString); //send Ajax request to your web server.
}