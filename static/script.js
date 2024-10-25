let activeTresholdButtonId = "t1";
let activeModelButtonId = "m1";

let choosed_treshold = 't1';
let choosed_model = 'm1';
let question_id = "";

console.log("jsssssss")

$(document).ready(function() {
    // Bind the event listener once when the document is ready
    $("form").on("submit", function(event) {
        event.preventDefault(); // Prevent the form from submitting normally
    });
});

function clear_input() {
    document.getElementById('query').value = '';
}

function configurationButton (buttonId, status) {
    console.log("here")
    if (status == 'treshold'){
        if (activeTresholdButtonId) {
            document.getElementById(activeTresholdButtonId).classList.remove('active_button');
            if (buttonId){
                document.getElementById(buttonId).classList.add('active_button');
                activeTresholdButtonId = buttonId; choosed_treshold = buttonId;
            }
        }
    }
    else if (status == 'model') {
        if (activeModelButtonId) {
            document.getElementById(activeModelButtonId).classList.remove('active_button');
            if (buttonId){
                document.getElementById(buttonId).classList.add('active_button');
                activeModelButtonId = buttonId; choosed_model = buttonId;
            }
        }
    }
}

function close_screen () {
    document.getElementById('not_retrieve_screen').style.display = 'none';
}

function goToUC3() {
    window.location.href = 'https://uc3.unej.ac.id/open.php';
}

function ask_question() {
    document.getElementById('loading_screen').style.display = 'flex';
    $("#analyze_container").hide();
    $("#result_container").hide();

    var aa = document.getElementById('query');
    console.log();

    var container = document.querySelector('.analyze_container');
    container.style.display = 'none';

    var query = $("input[name='query']").val();
    console.log(query, "masukk"); // Print query on the console

    $.ajax({
        url: "/retrieval",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ query: query, choosed_model: choosed_model, choosed_treshold: choosed_treshold }),                
        success: function(response) {
            console.log(response);

            console.log(response.question_text);

            document.getElementById('loading_screen').style.display = 'none';
            document.getElementById('question_container').style.display = 'none';
            $("#result_container").show();
            $("#get_other_container").hide();

            $(".result_container #user_query").html(response.query);
            $(".result_container #answer_text").html(response.paraphrased_answer);

            if (response.status === "above_treshold") {
                $(".indicator").addClass("green");
                $("#treshold_score").addClass("green");
                $("#treshold_score").text(response.print_status);
            } else {
                $(".indicator").addClass("red");
                $("#treshold_score").addClass("red");
                $("#treshold_score").text(response.print_status);
                document.getElementById('not_retrieve_screen').style.display = 'flex';
            }

            

        }
    });
}

function toggleContainer(id) {
    var container = document.querySelector('.'+id);
    if (container.style.display === 'none') {
        container.style.display = 'flex';
    } else {
        container.style.display = 'none';
    }
}

function get_question () {

    console.log("here man")

    $.ajax({
        url: "/get_question",
        type: "GET",
        contentType: "application/json",   
        data: JSON.stringify({ query: query }),           
        success: function(response) {

          console.log("success man");

          var container = document.querySelector('.question_container');

          document.getElementById('question_container').style.display = 'flex';

          $('#question_container').empty();

          response.forEach(function(item) {
              $(".question_container").append(
                  `<div class="copyable" onclick="copyToClipboard(${item.ticket_id})" id="${item.ticket_id}">${item.question}</div>`
              );
          });
        }
    });
}

function get_other () {

    document.getElementById('loading_screen').style.display = 'flex';
    console.log("running get_other function")
    $('#get_other').empty();

    $.ajax({
        url: "/get_other",
        type: "GET",
        contentType: "application/json",         
        success: function(response) {

            response.forEach(function(item) {
              $("#get_other").append(
                  ` <tr >
                        <td>${item.retrieved_id}</td>
                        <td>${item.similarity_between_question}</td>
                        <td>${item.retrieved_question}</td>
                        <td>${item.paraphrased_answer}</td>
                        <td>${item.final_bleu_score2}</td>
                        <td>${item.final_rouge_score1}</td>
                    </tr>`
              );

            console.log("done retireve other");
            $("#get_other_container").show();
            document.getElementById('loading_screen').style.display = 'none';
          });
        }
    });
}

function highlightDifferences(a, b) {
    const wordsA = a.split(' ');
    const wordsB = b.split(' ');

    let resultA = [];
    let resultB = [];

    for (let i = 0; i < Math.max(wordsA.length, wordsB.length); i++) {
        if (wordsA[i] !== wordsB[i]) {
            resultA.push('<span class="diff">' + (wordsA[i] || '') + '</span>');
            resultB.push('<span class="diff">' + (wordsB[i] || '') + '</span>');
        } else {
            resultA.push(wordsA[i]);
            resultB.push(wordsB[i]);
        }
    }

    console.log(resultA.join(' '))

    return { aHighlighted: resultA.join(' '), bHighlighted: resultB.join(' ') };
}


function analyze () {

    document.getElementById('loading_screen').style.display = 'flex';
    $("#analyze_loading").show();

    var user_query = document.getElementById("user_query").textContent;
    var user_answer = document.getElementById("answer_text").textContent;
    event.preventDefault(); // Prevent the form from submitting normally

    console.log("ini : ", question_id)

    $.ajax({
        url: "/analyze",
        type: "POST",
        contentType: "application/json",   
        data: JSON.stringify({ ticket_id: question_id, query: user_query, answer_text: user_answer }),           
        success: function(response) {

            const { aHighlighted, bHighlighted } = highlightDifferences(response.retrieved_answer, response.paraphrased_answer);

            $('#inputed_query').text(response.query);
            $('#actual_question').text(response.actual_question);
            $('#retrieved_question').text(response.retrieved_question);

            $('#retrieved_answer').html(`<p>${aHighlighted}</p>`);
            $('#paraphrased_answer').html(`<p>${bHighlighted}</p>`);

            $('#retrieved_id').text(response.retrieved_id);
            $('#actual_id').text(response.actual_id);
            $('#similarity_between_question').text(response.similarity_between_question);
            $('#BLEU_between_question').text(response.BLEU_between_question);
            $('#ROUGE_between_question').text(response.ROUGE_between_question);
            $('#similarity_between_answer').text(response.similarity_between_answer);
            $('#BLEU_between_answer').text(response.BLEU_between_answer);
            $('#ROUGE_between_answer').text(response.ROUGE_between_answer);
            $('#choosed_model').text(response.paraphrased_model);

          $("#analyze_loading").hide();
          document.getElementById('loading_screen').style.display = 'none';

          var container = document.querySelector('.analyze_container');
          container.style.display = 'flex';

          console.log(response);
        }
    });
}

function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function copyToClipboard(id) {
    question_id = id

    const textToCopy = document.getElementById(id).innerText;

    // Create a temporary textarea to copy the text
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = textToCopy;
    document.body.appendChild(tempTextArea);

    // Select the text and copy it to the clipboard
    tempTextArea.select();
    document.execCommand('copy');

    // Remove the temporary textarea
    document.body.removeChild(tempTextArea);

    // Optionally, provide visual feedback to the user
    document.getElementById('copyDiv').innerText = 'Copied!';
    setTimeout(function() {
        document.getElementById('copyDiv').innerText = textToCopy;
    }, 1000); // Reset after 1 second
}