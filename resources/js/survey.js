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
  var formdata = new FormData();
  Object.keys(survey.data).forEach(function(key) {
    if (key != "question9")
      formdata.append("fields[" + key + "]", survey.data[key].toString())
    else {
      Object.keys(survey.data[key]).forEach(function(index) {
        var letter = String.fromCharCode(97 + (index - 1))
        formdata.append("fields[" + key + letter + "]", survey.data[key][index].toString())
      })
    }
  })
  var data = new URLSearchParams(formdata);
  fetch("https://dev.staticman.net/v2/entry/simonarnell/GDPRDPIAT/staticman/", {
    method: "POST",
    body: data
  })
}