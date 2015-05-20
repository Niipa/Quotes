package stockQuotes.base;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.URL;
import java.net.URLDecoder;
import java.net.HttpURLConnection;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class BaseServlet extends HttpServlet{

  // Sanitize query string by only accepting substrings in the query string that fit this pattern.
  private Pattern pattWhiteList;
  // URL to send to YQL.
  private String strBaseYQLQuery1stPart;
  private String strBaseYQLQuery2ndPart;
  public void init() throws ServletException{
    this.pattWhiteList = Pattern.compile("[A-Za-z\\-]{1,5}");
    this.strBaseYQLQuery1stPart = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quote%20where%20symbol%20in%20(";
    this.strBaseYQLQuery2ndPart = ")&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
  }
  
  public void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    
    response.setContentType("application/json");
    // Pull the query string from the request, remove the "in=", 
    // then decode that encoded query string.
    String strQryString = URLDecoder.decode((request.getQueryString()).substring(3), "UTF-8"),
           strQryToYQL = strBaseYQLQuery1stPart;
    
    // Create an array of Ticker Symbols, Sanitize, and Generate URL for YQL Query
    String[] arrTickerSymbols = strQryString.replaceAll(" ", "").split(",");
    for(int itr = 0; itr < arrTickerSymbols.length; ++itr){
      // If this string does not match a US ticker symbol, then complain.
      // US Ticker Symbols are by convention between 1-5 characters, and have no numbers.
      if(!pattWhiteList.matcher(arrTickerSymbols[itr]).matches()){
        response.setStatus(500);
        System.err.println("**** STRING IS DENIED BY WHITELIST ****");
        System.err.println(arrTickerSymbols[itr]);
        return;
      }
      
      // Decodes to "<ticketSymbol>"
      strQryToYQL += "%22" + arrTickerSymbols[itr] + "%22";
      // Last ticker symbol, then add the closing part of the query.
      if(itr == arrTickerSymbols.length-1){
        strQryToYQL += strBaseYQLQuery2ndPart;
      }
      // Otherwise add a comma
      else{
        strQryToYQL += "%2C";
      }
      
    }
    
    response.setCharacterEncoding("UTF-8");
    response.setStatus(200);
    PrintWriter pw = response.getWriter();
    pw.write(sendGet(strQryToYQL));
    pw.flush();
  }
  
  // Blocking IO to get data from YQL, can't proceed without it.
  private String sendGet(String strURL) throws IOException{
    
    URL obj = new URL(strURL);
    HttpURLConnection conn = (HttpURLConnection)obj.openConnection();
    conn.setRequestMethod("GET");
    conn.setRequestProperty("User-Agent", "Tomcat8");
    
    int responseCode = conn.getResponseCode();
    System.out.println("\nSent request to YQL using : " + strURL);
    System.out.println("Status Code : " + responseCode);
    
    BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
    String respInput;
    StringBuffer response = new StringBuffer();
    // Keep reading until we have the entire response from YQL.
    while((respInput = in.readLine()) != null){
      response.append(respInput);
    }
    in.close();
    
    System.out.println(response.toString());
    return response.toString();
  }
  
}
