package servlet;


import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.zip.GZIPOutputStream;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

/**
 * Servlet implementation class GZipServlet
 */
@WebServlet("/GZipServlet")
public class GZipServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	JSONParser parser = new JSONParser();
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public GZipServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

    public void doGet(HttpServletRequest req, HttpServletResponse res)
			throws ServletException, IOException {
    	String q = req.getParameter("q");
    	String meta = req.getParameter("meta");
    	String dataset = req.getParameter("dataset");
		
    	if (q!=null){
        	String [] tiles = q.split("_");
        	
        	String tile = "error!";
        	
        	JSONArray jsonArray = new JSONArray();
        	
        	try {
        		Object obj;
        		String s = "";
        		//JSONObject [] jsonTiles = new JSONObject [tiles.length];
        		
        		String tileDirectory = dataset.equals("0") ? "brightkite" : "faa";
        		
        		for (int i = 0; i < tiles.length; i++){
        			obj = parser.parse(new FileReader( getServletContext().getRealPath("tiles"+ File.separator + tileDirectory + File.separator + tiles[i] + ".json" ) ));
        			//s +=  ((JSONObject) obj) + "\r\n";//.get("meta").toString()
        			jsonArray.add((JSONObject) obj);
        		}
        		
    			tile = jsonArray.toJSONString();
    			
    			zipAndSend(req, res, tile);
    			
    		} catch (ParseException e) {
    			// TODO Auto-generated catch block
    			e.printStackTrace();
    		}
    	}
    	else if (meta!=null){
    		
    		JSONArray jsonArray = new JSONArray();
    		
    		
    		//System.out.println(dataset);
    		
    		if (dataset.equals("0")){
    			//brightkite
    			String [] months = new String [] {"Jan", "Feb", "Mar", "Apr", "May","Jun",
    					"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
    			String [] days =  new String [] {"1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", 
    						"14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"};
    			String [] hours = new String []{"1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", 
							"14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"};
    			
    			for (int col = 0; col < 5; col++){
        			JSONObject o = new JSONObject();
            		o.put("dim", col);
            		o.put("dType", col <= 1 ? col : 3 );
            		o.put("binsPerTile", col <= 1 ? 256 : col == 2 ? 12 : col == 3 ? 31 : 24  );
            		o.put("totalBinCnt", col <= 1 ? 512 : col == 2 ? 12 : col == 3 ? 31 : 24  );
            		if (col == 2){ //month
            			JSONArray a = new JSONArray();
            			for (int c = 0; c < months.length; c++)
            				a.add(months[c]);
            			o.put("binNames", a);
            		}
            		else if (col == 3){//day
            			JSONArray a = new JSONArray();
            			for (int c = 0; c < days.length; c++)
            				a.add(days[c]);
            			o.put("binNames", a);
            		}
            		else if (col == 4){//hour
            			JSONArray a = new JSONArray();
            			for (int c = 0; c < hours.length; c++)
            				a.add(hours[c]);
            			o.put("binNames", a);
            		}
            		else {
            			o.put("binStartValue",  0 );
            			o.put("binWidth", col <=1 ? 15 : 1);
            		}
            		jsonArray.add(o);
            		
        		}
    		}
    		else if (dataset.equals("1")){
    			//faa
    			int [] binCnts = new int [] {174, 174, 28, 20, 31, 7};
    			int [] binCntsPerTile = new int [] {174, 174, 28, 20, 31, 7};
    			String [] carriers = new String [] {"FL", "US", "OH", "DH", "AS","OO",
    					"B6", "9E", "PI", "CO", "PA (1)", "AQ", "HA",
    					"XE", "EA", "NW", "DL", "EV", "ML (1)", "MQ",
    					"TW", "YV", "TZ", "HP", "WN", "UA", "F9", "AA"};
    			String [] dayOfWeek =  new String [] {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
    			String [] years = new String []{"1989", "1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997",
    					"1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008"};
    			
    			for (int col = 0; col < 6; col++){
        			JSONObject o = new JSONObject();
            		o.put("dim", col);
            		o.put("dType", (col  >= 2) ? 3 : 2 );
            		o.put("binsPerTile", binCntsPerTile[col]  );
            		o.put("totalBinCnt", binCnts[col]  );
            		if (col == 2){ //carriers
            			JSONArray a = new JSONArray();
            			for (int c = 0; c < carriers.length; c++)
            				a.add(carriers[c]);
            			o.put("binNames", a);
            		}
            		else if (col == 3){
            			JSONArray a = new JSONArray();
            			for (int c = 0; c < years.length; c++)
            				a.add(years[c]);
            			o.put("binNames", a);
            		}
            		else if (col == 5){
            			JSONArray a = new JSONArray();
            			for (int c = 0; c < dayOfWeek.length; c++)
            				a.add(dayOfWeek[c]);
            			o.put("binNames", a);
            		}
            		else {
            			o.put("binStartValue",  0 );
            			o.put("binWidth", col <=1 ? 15 : 1);
            		}
            		jsonArray.add(o);
            		
        		}
    		}
    		
    		
    		zipAndSend(req, res, jsonArray.toJSONString());
    	}
    	
	}
    
    private void zipAndSend(HttpServletRequest req, HttpServletResponse res, String data) throws IOException{
    	String encoding = req.getHeader("Accept-Encoding");
		boolean canGzip = false;

		if (encoding != null)
			if (encoding.indexOf("gzip") >= 0)
				canGzip = true;

		//canGzip = false;

		if (canGzip) {
			res.setHeader("Content-Encoding", "gzip");
			OutputStream o = res.getOutputStream();
			GZIPOutputStream gz = new GZIPOutputStream(o);

//			String bigStuff = "";
//			bigStuff += "<html>";
//			bigStuff += "<br>this was compressed";
//			bigStuff += "</html>";
			gz.write(data.getBytes());
			gz.close();
			o.close();

		} else // no compression
		{
			PrintWriter out = res.getWriter();
			res.setContentType("text/html");

			out.println("<html>");
			out.println("<br>no compression here");
			out.println("</html>");

			out.flush();
			out.close();
		}
    }

	public void doPost(HttpServletRequest req, HttpServletResponse res)
			throws ServletException, IOException {

		String encoding = req.getHeader("Accept-Encoding");
		boolean canGzip = false;

		if (encoding != null)
			if (encoding.indexOf("gzip") >= 0)
				canGzip = true;

		//canGzip = false;

		if (canGzip) {
			res.setHeader("Content-Encoding", "gzip");
			OutputStream o = res.getOutputStream();
			GZIPOutputStream gz = new GZIPOutputStream(o);

			String bigStuff = "";
			bigStuff += "<html>";
			bigStuff += "<br>this was compressed";
			bigStuff += "</html>";
			gz.write(bigStuff.getBytes());
			gz.close();
			o.close();

		} else // no compression
		{
			PrintWriter out = res.getWriter();
			res.setContentType("text/html");

			out.println("<html>");
			out.println("<br>no compression here");
			out.println("</html>");

			out.flush();
			out.close();
		}
	}

}

