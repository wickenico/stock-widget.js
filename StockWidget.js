// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: book; share-sheet-inputs: plain-text;
// Stock Ticker Widget
let stocksInfo = await getStockData()
let api = await randomAPI()
let widget = await createWidget(api)
if (config.runsInWidget) {
  // The script runs inside a widget, so we pass our instance of ListWidget to be shown inside the widget on the Home Screen.
  Script.setWidget(widget)
} else {
  // The script runs inside the app, so we preview the widget.
  widget.presentSmall()
}
// Calling Script.complete() signals to Scriptable that the script have finished running.
// This can speed up the execution, in particular when running the script from Shortcuts or using Siri.
Script.complete()

async function createWidget(api) {
  
  let upticker = SFSymbol.named("chevron.up");
  let downticker = SFSymbol.named("chevron.down");
 
  let widget = new ListWidget()
  // Add background gradient
  let gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color("141414"),
    new Color("13233F")
  ]
  widget.backgroundGradient = gradient

  for(j=0; j<stocksInfo.length; j++)
  {
   
    let currentStock = stocksInfo[j];
    let row1 = widget.addStack();
    // Add Stock Symbol
    let stockSymbol = row1.addText(currentStock.symbol);
    stockSymbol.textColor = Color.white();
    stockSymbol.font = Font.boldMonospacedSystemFont(12);
    //Add Current Price
    row1.addSpacer();
    let symbolPrice = row1.addText(currentStock.price);
    symbolPrice.textColor = Color.white();
    symbolPrice.font = Font.boldMonospacedSystemFont(12);
   
    //Second Row
    widget.addSpacer(2)
    let row2= widget.addStack();
    // Add Company name
    let companyName= row2.addText(currentStock.name);
    companyName.textColor = Color.white();
    companyName.textOpacity = 0.7;
    companyName.font = Font.boldMonospacedSystemFont(9);
    //Add Today's change in price
    row2.addSpacer();
    let changeValue = row2.addText(currentStock.changevalue);
    if(currentStock.changevalue < 0) {
      changeValue.textColor = Color.red();
    } else {
      changeValue.textColor = Color.green();
    }
    changeValue.font = Font.boldMonospacedSystemFont(9);
    
    // Add Ticker icon
    row2.addSpacer(2);
    let ticker = null;
    if(currentStock.changevalue < 0){
      ticker = row2.addImage(downticker.image);
      ticker.tintColor = Color.red();
    } else {
      ticker = row2.addImage(upticker.image);
      ticker.tintColor = Color.green();
    }
       
    ticker.imageSize = new Size(8,8);
   
    widget.addSpacer(6);
   
  }
  return widget
}

async function getStockData() { 
  let stocks = null;
// Read from WidgetParameter if present or use hardcoded values
// Provide values in Widget Parameter as comma seperated list  
  if(args.widgetParameter == null) {
    stocks = ["PRGS", "AAPL", "INR=X", "XRP-USD"];
  } else {
    stocks = args.widgetParameter.split(",");
  }
 
  let stocksdata = [];
  for(i=0; i< stocks.length; i++)
  {
    let stkdata = await queryStockData(stocks[i].trim());
    let price = stkdata.quoteSummary.result[0].price;
    let priceKeys = Object.keys(price);
 
    let data = {};
    data.symbol = price.symbol;
    data.changepercent = (price.regularMarketChangePercent.raw * 100).toFixed(2);
    data.changevalue = price.regularMarketChange.raw.toFixed(2);
    data.price = price.regularMarketPrice.raw.toFixed(2);
    data.high = price.regularMarketDayHigh.raw.toFixed(2);
    data.low = price.regularMarketDayLow.raw.toFixed(2);
    data.prevclose = price.regularMarketPreviousClose.raw.toFixed(2);
    data.name = price.shortName;
    stocksdata.push(data);
   
  }
  return stocksdata;
}

async function queryStockData(symbol) {
  let url = "https://query1.finance.yahoo.com/v10/finance/quoteSummary/" + symbol + "?modules=price"
  let req = new Request(url)
  return await req.loadJSON()
}