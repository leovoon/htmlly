
var lengthofobject = Object(data.quizcontent).length;
var curPage = 0, numOfCorrect = 0;
var myAnswers = [];

var newimage = document.getElementById("quizimage");
var myHeader = document.getElementById("quizHeader");
var classname = document.getElementsByClassName("answer");
var myQuestion = document.getElementById("questions");
var progressBar = document.getElementById("progressBar");
var btnPrevious = document.getElementById("btnPrevious");
var btnNext = document.getElementById("btnNext");
var btnFinish = document.getElementById("finishQuiz");
var btnRepeat = document.getElementById('repeatQuiz');

checkPage();

btnPrevious.addEventListener("click",moveBack);
btnNext.addEventListener("click",moveNext);
btnFinish.addEventListener("click",endQuiz);


for(var i = 0; i < classname.length; i++) {
    classname[i].addEventListener('click',myAnswer, false);
}

function myAnswer() {
    var idAnswer = this.getAttribute("data-id");
    // check for correct answer
    
    myAnswers[curPage] = idAnswer;
    if(data.quizcontent[curPage].correct == idAnswer) {
        console.log('Betul');
    }
    else {
        console.log('Salah');
    }
    addBox();
} 

function addBox() {
    for(var i=0; i<myQuestion.children.length; i++) {
        var curNode = myQuestion.children[i];
        if(myAnswers[curPage] == (i + 1)) {
            curNode.classList.add("selAnswer");
        }
        else {
            curNode.classList.remove("selAnswer");
        }
    }
}

function moveNext() {
    // check if an answer has been made
    
    if(myAnswers[curPage]) {
        console.log('Sambung soalan seterusnya');
        if(curPage < (lengthofobject - 1)) {
            curPage++;
            checkPage(curPage);
        }
        else {
            //check if quiz is completed
            console.log(curPage + ' ' + lengthofobject);
            if(lengthofobject >= curPage) {
                endQuiz();
            }
            else {
              console.log('Kuiz Tamat ' + curPage);  
            }
        }
    }
    else {
        console.log('Tidak menjawab');
    }
}

function endQuiz() {
    if(myAnswers[lengthofobject-1]) {
        var output = "<table id='resultTable' class='table table-hover output'><thead><tr><th>Soalan</th><th>Keputusan</th></tr></thead><tbody>";
        var questionResult = "NA";
        //console.log('Quiz Over');
        for( var i = 0; i< myAnswers.length; i++) {

            if(data.quizcontent[i].correct == myAnswers[i]) {
                questionResult = '<span style="color: green;"><i class="fas fa-check-circle"></i></span>';
                numOfCorrect++;
            }
            else {
                questionResult = '<span style="color: red;"><i class="fas fa-times-circle"></i></span>';
            }
            output = output + `<tr><td>Question ${i+1} <p class="lead">${data.quizcontent[i].question}</p></td> <td> ${questionResult} </td></tr>`
        
    
        }
        output = `<p class='d-flex align-self-center mr-3'>Anda mendapat <h1 class='text-result'>${numOfCorrect} / ${lengthofobject}</h1></p><br>${output} </tbody></table>`;
        document.getElementById("quizContent").innerHTML = output;
        btnPrevious.classList.add('hide');
        btnFinish.classList.add('hide');
        btnRepeat.classList.remove('hide');
        progressBar.classList.add('hide');
        
        
    }
    else  {
        console.log('Tidak menjawab');
    }
}

function checkPage(i) {
   // add remove disabled buttons if there are no more questions in que
    
   if(curPage==0) {
       btnPrevious.classList.add("hide");
   }
   else {
       btnPrevious.classList.remove("hide");
   }
   
   if((curPage+1) < (lengthofobject)) {
       btnNext.classList.remove("hide");
   }
   else {
       btnNext.classList.add("hide");
       btnFinish.classList.remove("hide");
   }
   
   myHeader.innerHTML = data.quizcontent[curPage].question;
   newimage.src = data.quizcontent[curPage].image;
   for (var i = 0; i < myQuestion.children.length; i++) {
        var curNode = myQuestion.children[i];
        curNode.childNodes[1].innerHTML = capitalise(data.quizcontent[curPage]["a"+(i+1)]);
        // check if answered already
        
        if(myAnswers[curPage] == (i + 1)) {
            curNode.classList.add("selAnswer");
        }
        else {
            curNode.classList.remove("selAnswer");
        }
   }
   //update progress bar
  
   var increment = Math.ceil((curPage+1)/(lengthofobject)*100);
   progressBar.style.width = (increment)+'%';
   progressBar.innerHTML = (increment)+'%';
}

function moveBack() {
    if(curPage > 0) {
        curPage--;
        checkPage(curPage);
    }
    else {
        console.log('Kuiz Tamat ' + curPage);
    }
}

function capitalise(str) {
    return str.substr(0,1).toUpperCase() + str.substr(1);
}
