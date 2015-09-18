// The MIT License (MIT)
// 
// Copyright (c) 2015 Menard "Ren" Soliven
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.


// Because of Chrome's evil deeds in trying to prevent cross-site scripting,
// the server that sent this page needs to make the call to YQL on the client's behalf.
var onEnter = function(){

  var req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if(req.readyState != 4) return;
    if(req.status != 200 && req.status != 304){
      console.log("HTTP error " + req.status);
      window.location.replace("http://zel.io/error.html")
      return;
    }
    cbOnYQLFinish(JSON.parse(req.responseText));
  }
  
  req.open("GET", "http://zel.io:8080/quotes/yql?in=" + 
    document.getElementById("idStockSymbols").value, true);
  req.send();
  
};

var arrFieldsWeCareAbout = [
"Name",
"StockExchange",
"Symbol",
"DaysRange",
"MarketCapitalization",
"Volume",
"AverageDailyVolume",
"Change",
"DaysLow",
"DaysHigh",
"YearLow",
"YearHigh",
"LastTradePriceOnly"
];

// Once we get the result json from YQL, hide the input form, update the result table.
var cbOnYQLFinish = function(jsonResult){
	
	var rslt = document.getElementById("resultTables");
	if(rslt.hasChildNodes()){
		while (rslt.firstChild) {
		    rslt.removeChild(rslt.firstChild);
		}
	}
	
	//
	if(jsonResult.query.count > 1){
		for(var idx = 0; idx < jsonResult.query.results.quote.length; ++idx){
			drawTable(jsonResult.query.results.quote[idx]);
		}
	}else{
		drawTable(jsonResult.query.results.quote);
	}

};

var drawTable = function(stockQuote){

    var tbl = document.createElement("table");
    tbl.setAttribute("class", "classStockTable");

    var nameRow = tbl.insertRow(0);
    nameRow.setAttribute("class", "classStockName");
    nameRow.innerHTML = stockQuote["Name"];

    // For every field we care about in the quote, add that row:value pair.
    for(var itr=1; itr<arrFieldsWeCareAbout.length; ++itr){
      var strFieldNameWeCareAbout = arrFieldsWeCareAbout[itr];
      var row = tbl.insertRow(itr);
      var cell1 = row.insertCell(0);
      cell1.setAttribute("class", "classTblCell0");
      cell1.innerHTML = strFieldNameWeCareAbout;
      var cell2 = row.insertCell(1);
      cell2.setAttribute("class", "classTblCell1");
      
      if(strFieldNameWeCareAbout === "Symbol"){
    	  cell2.innerHTML = (stockQuote[strFieldNameWeCareAbout]).toUpperCase();
      }else{
          cell2.innerHTML = (stockQuote[strFieldNameWeCareAbout]).toUpperCase();    	  
      }
    }
	
	// Push that table we just created into _divTables_RESULT.
	_divTables_RESULT.appendChild(tbl);
	// Make it look nice with spacing.
	var hr = document.createElement("hr");
	hr.style.color = "#B0B0B0";
	hr.style.width = "100%";
	_divTables_RESULT.appendChild(hr);
};

_form_INPUT = document.getElementById("frm");
_divTables_RESULT = document.getElementById("resultTables");


document.getElementById("frm").addEventListener("submit", function(e){
  e.preventDefault();
});

var idStockSymbols = document.getElementById("idStockSymbols");
idStockSymbols.addEventListener("keyup",
  function(e){
    if(e.keyCode == 13){
      onEnter();
    }
  }
);
idStockSymbols.addEventListener("focus", function(e){
	document.getElementById("frm").style.borderColor = "#6495ED";
});
idStockSymbols.addEventListener("blur", function(e){
	document.getElementById("frm").style.borderColor = "#B0B0B0";
});
idStockSymbols.focus();
