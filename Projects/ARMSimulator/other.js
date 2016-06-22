function displayPlaceHolder(value){
  var machineCode = $("#sourceCode").val().split("\n");
  $("#sourceCode").val("");
  if(machineCode.length == 0){
    var placeholder = "";
    if(value == 0)
       placeholder = "Enter Instructions in Binary (base 2)";
    else if(value == 1)
       placeholder = "Enter Instructions in Hexadecimal (base 16)";
    else if(value == 2)
       placeholder = "Enter Instructions in Decimal (base 10)";
    $("#sourceCode").attr("placeholder", placeholder);
  }else{
    // if(value == 0){
    //   for(var i = 0; i<machineCode.length; i++){
    //     if(checkDec(machineCode[0])){
    //       appendMachineCode(pad(Dec2Bin(parseInt(machineCode[i])),8));
    //     }else if(checkHex(machineCode[0])){
    //       appendMachineCode(pad(Hex2Bin(parseInt(machineCode[i])),8));
    //     }
    //   }
    // }else if(value == 2){
    //   for(var i = 0; i<machineCode.length; i++){
    //     if(checkBin(machineCode[0])){
    //       appendMachineCode(Bin2Dec(parseInt(machineCode[i])));
    //     }else if(checkHex(machineCode[0])){
    //       appendMachineCode(Hex2Dec(parseInt(machineCode[i])));
    //     }
    //   }
    // }else if(value == 1){
    //   for(var i = 0; i<machineCode.length; i++){
    //     if(checkBin(machineCode[0])){
    //       appendMachineCode("0x"+Bin2Hex(parseInt(machineCode[i])));
    //     }else if(checkDec(machineCode[0])){
    //       appendMachineCode("0x"+Dec2Hex(parseInt(machineCode[i])));
    //     }
    //   }
    // }
  }
}

$(document).ready(function() {
  var textArea = $("#assemblyCode")[0];
  var editor = CodeMirror.fromTextArea(textArea, {
      lineNumbers: true,
      gutter: true,
      lineWrapping: true,
      smartIndent: true
  });

  var primaryComment = "// Hello World\n\n";
  var primaryCode = ".code \nbl printHello \nswi 6 \n\nprintHello: \n\tldr r0,=hello\n\tswi 5\n\tbx lr\n\n";
  var primaryData = ".data \n\t hello: .asciiz \"Hello World\"";

  editor.getDoc().setValue(primaryComment+primaryCode+primaryData);
  editor.setSize("100%","592px");
  $('#assemblyCode').data('CodeMirrorInstance', editor);

  // var resultArea = $("#result")[0];
  // var resultEditor = CodeMirror.fromTextArea(resultArea, {lineNumbers: true,gutter: true,lineWrapping: true,readOnly:true,autoRefresh:true});
  // $('#result').data('CodeMirrorResultInstance', resultEditor);

  $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  });
});

function selectLine(line){
  selectTextareaLine($("#result")[0],line);
}

function selectTextareaLine(tarea,lineNum) {
    lineNum--; // array starts at 0
    var lines = tarea.value.split("\n");

    // calculate start/end
    var startPos = 0, endPos = tarea.value.length;
    for(var x = 0; x < lines.length; x++) {
        if(x == lineNum) {
            break;
        }
        startPos += (lines[x].length+1);

    }

    var endPos = lines[lineNum].length+startPos;

    // do selection
    // Chrome / Firefox

    if(typeof(tarea.selectionStart) != "undefined") {
        tarea.focus();
        tarea.selectionStart = startPos;
        tarea.selectionEnd = endPos;
        return true;
    }

    // IE
    if (document.selection && document.selection.createRange) {
        tarea.focus();
        tarea.select();
        var range = document.selection.createRange();
        range.collapse(true);
        range.moveEnd("character", endPos);
        range.moveStart("character", startPos);
        range.select();
        return true;
    }

    return false;
}

String.prototype.format = function() {
  var formatted = this;
  for (var i = 0; i < arguments.length; i++) {
    var regexp = new RegExp('\\{'+i+'\\}', 'gi');
    formatted = formatted.replace(regexp, arguments[i]);
  }
  return formatted;
};

//Useful Functions
function checkBin(n){return/^[01]{1,64}$/.test(n)}
function checkDec(n){return/^[0-9]{1,64}$/.test(n)}
function checkHex(n){return/^[0-9A-Fa-f]{1,64}$/.test(n)}
function pad(s,z){s=""+s;return s.length<z?pad("0"+s,z):s}
function unpad(s){s=""+s;return s.replace(/^0+/,'')}

//Decimal operations
function Dec2Bin(n){
  if(n<0) return (n>>>0).toString(2);
  if(!checkDec(n)) return 0;
  return n.toString(2)
}
function Dec2Hex(n){
  if(n<0) return (n>>>0).toString(16);
  if(!checkDec(n)) return 0;
  return n.toString(16)
}

//Binary Operations
function Bin2Dec(n){if(!checkBin(n))return 0;return parseInt(n,2).toString(10)}
function Bin2Hex(n){if(!checkBin(n))return 0;return parseInt(n,2).toString(16)}

//Hexadecimal Operations
function Hex2Bin(n){if(!checkHex(n))return 0;return parseInt(n,16).toString(2)}
function Hex2Dec(n){if(!checkHex(n))return 0;return parseInt(n,16).toString(10)}

function encodeFloat(number) {
    var n = +number,
        status = (n !== n) || n == -Infinity || n == +Infinity ? n : 0,
        exp = 0,
        len = 281, // 2 * 127 + 1 + 23 + 3,
        bin = new Array(len),
        signal = (n = status !== 0 ? 0 : n) < 0,
        n = Math.abs(n),
        intPart = Math.floor(n),
        floatPart = n - intPart,
        i, lastBit, rounded, j, exponent;
    if (status !== 0) {
        if (n !== n) {
            return 0x7fc00000;
        }
        if (n === Infinity) {
            return 0x7f800000;
        }
        if (n === -Infinity) {
            return 0xff800000
        }
    }
    i = len;
    while (i) { bin[--i] = 0;}
    i = 129;
    while (intPart && i) { bin[--i] = intPart % 2; intPart = Math.floor(intPart / 2);}
    i = 128;
    while (floatPart > 0 && i) {(bin[++i] = ((floatPart *= 2) >= 1) - 0) && --floatPart;}
    i = -1;
    while (++i < len && !bin[i]);
    if (bin[(lastBit = 22 + (i = (exp = 128 - i) >= -126 && exp <= 127 ? i + 1 : 128 - (exp = -127))) + 1]) {
        if (!(rounded = bin[lastBit])) {
            j = lastBit + 2;
            while (!rounded && j < len) { rounded = bin[j++]; }
        }
        j = lastBit + 1;
        while (rounded && --j >= 0) { (bin[j] = !bin[j] - 0) && (rounded = 0); }
    }
    i = i - 2 < 0 ? -1 : i - 3;
    while(++i < len && !bin[i]);
    (exp = 128 - i) >= -126 && exp <= 127 ? ++i : exp < -126 && (i = 255, exp = -127);
    (intPart || status !== 0) && (exp = 128, i = 129, status == -Infinity ? signal = 1 : (status !== status) && (bin[i] = 1));
    n = Math.abs(exp + 127);
    exponent = 0;
    j = 0;
    while (j < 8) {
        exponent += (n % 2) << j;
        n >>= 1;
        j++;
    }
    var mantissa = 0;
    n = i + 23;
    for (; i < n; i++) {
        mantissa = (mantissa << 1) + bin[i];
    }
    return ((signal ? 0x80000000 : 0) + (exponent << 23) + mantissa) | 0;
}


function convert(){
  var cvtFrom = parseInt($( "#cvtFromType option:selected" ).val());
  var cvtTo = parseInt($( "#cvtToType option:selected" ).val());
  var value = $( "#cvtFrom" ).val();
  switch (cvtFrom) {
    case 0:
    switch (cvtTo) {
      case 1:
      $( "#cvtTo" ).val(Bin2Hex(value));
      break;
      case 2:
      $( "#cvtTo" ).val(Bin2Dec(value));
      break;
      default:
      $( "#cvtTo" ).val(value);
      break;
    }
    break;
    case 1:
    switch (cvtTo) {
      case 0:
      $( "#cvtTo" ).val(Hex2Bin(value));
      break;
      case 2:
      $( "#cvtTo" ).val(Hex2Dec(value));
      break;
      default:
      $( "#cvtTo" ).val(value);
      break;
    }
    break;
    case 2:
    switch (cvtTo) {
      case 0:
      $( "#cvtTo" ).val(Dec2Bin(parseInt(value)));
      break;
      case 1:
      $( "#cvtTo" ).val(Dec2Hex(parseInt(value)));
      break;
      default:
      $( "#cvtTo" ).val(value);
      break;
    }
    break;
    default:
    break;
  }
}

function asrHelper(x){
  var ones = "";
  while(x--) ones+="1";
  return Bin2Dec(ones);
}

function appendHeader(){
  appendMachineCode(200);
  appendMachineCode(0);
  appendMachineCode(0);
  appendMachineCode(0);
  appendMachineCode(8);
  appendMachineCode(0);
  appendMachineCode(0);
  appendMachineCode(0);
}

printMatch = function(match){
    for(var i = 0; i<match.length; i++){
      if(match[i]){
        console.log(match[i]);
      }
      console.log(0xFFFFF000>>>4);
    }
}

getChar = function (value) {
  var text = String.fromCharCode(value);
  if (text.trim() === '') {
      return '\u00A0\u00A0';
  } else {
      return text;
  }
}

function readFile(evt) {
  //Retrieve the first (and only!) File from the FileList object
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    var file = evt.target.files[0];
    if (file) {
      var read = new FileReader();
      read.onload = function(e){
        var contents = e.target.result;
        var data =  new Uint8Array(contents);
        for(var i = 0; i<data.length; i++){
          appendMachineCode(data[i]);
        }
    }
    //read.readAsBinaryString(file);
    read.readAsArrayBuffer(file);
  } else {
    alert("Failed to load file");
  }
 }else
  alert('The File APIs are not fully supported by your browser.');
}
