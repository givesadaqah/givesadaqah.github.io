// user details 
const userInfo = {
 avatar: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/668895/profile/profile-512.jpg', 
 hero: 'https://static.codepen.io/assets/profile/profile-bg-8ff33bd9518be912289d4620cb48f21eb5c9a2e0b9577484126cfe10a5fb354f.svg', 
 name: 'Give Sadaqah', 
 info: 'Help The Needs', 
}; 

// crypto wallets 
const cryptoWallets = [
 {
  symbol: 'BTC', 
  name: 'Bitcoin',
  address: 'bc1q2rzsnym93jtaha6ueq8wlznwq25vt00vux9dwf', 
 }, 
 {
  symbol: 'ETH', 
  name: 'Etherium',
  address: '0x192055b04F36aE382d8759913BbB02268C4563Dd', 
 }, 
 {
  symbol: 'Solana', 
  name: 'SOL',
  address: '3bV9FJJMd2gUryVitpM4CPbyLswv4KiqaTgTmqhnLRVE', 
 }
];

// number format filter 
Vue.filter( 'toMoney', ( num, decimals ) => {
 let o = { style: 'decimal', minimumFractionDigits: decimals, maximumFractionDigits: decimals };
 return new Intl.NumberFormat( 'en-US', o ).format( num );
});

// vue instance 
new Vue({
 el: '#card', 
 
 // app data 
 data: {
  userInfo, 
  cryptoWallets,
  tab: 'BTC', 
  wallet: {}, 
  statsCache: {}, 
  stats: {}, 
 }, 
 
 // computed methods 
 computed: {
  
  // compute list wallets for tabs 
  walletsList() {
   return this.cryptoWallets.map( w => {
    w.active = ( w.symbol === this.tab ); 
    return w;
   }); 
  }, 
 }, 
 
 // custom methods 
 methods: {
  
  // select active tab wallet 
  selectWallet( symbol ) {
   let wallet = this.cryptoWallets.filter( w => w.symbol === symbol ).shift(); 
   if ( !wallet ) return; 
   wallet.copied = 0; 
   this.wallet = wallet;  
   this.tab = symbol; 
   this.fetchStats( symbol ); 
  },  
  
  // copy text to clipboard
  copyText( txt ) {
   txt = String( txt || '' ).trim();
   if ( !txt ) return;
   let input = document.createElement( 'input' );
   document.body.appendChild( input );
   input.value = txt;
   input.select();
   document.execCommand( 'Copy' );
   document.body.removeChild( input ); 
   this.wallet = Object.assign( {}, this.wallet, { copied: 1 } ); 
  },
  
  // get qr image url for selected wallet 
  getQrImage() {
   const w = 180; 
   const h = 180; 
   const a = this.wallet.address; 
   return `https://chart.googleapis.com/chart?chs=${w}x${h}&cht=qr&choe=UTF-8&chl=${a}`;
  }, 
  
  // set coin stats 
  setStats( symbol, data ) {
   let price  = 0;
   let cap    = 0;
   let supply = 0;
   let time   = Date.now(); 
   let stats  = Object.assign( { price, cap, supply, time }, data ); 
   this.statsCache[ symbol ] = stats; 
   this.stats = stats; 
  }, 
  
  // fetch market stats for a symbol 
  fetchStats( symbol ) {
   let stats = this.statsCache[ symbol ] || null; 
   let price = stats ? stats.price : 0; 
   let secs  = stats ? ( ( Date.now() - stats.time ) / 1000 ) : 0; 
   
   // use values from cache 
   if ( price && secs < 300 ) {
    return this.setStats( symbol, stats );
   }
   // reset and fetch new values from api 
   this.setStats( symbol ); 
   const xhr = new XMLHttpRequest();
   xhr.open( 'GET', 'https://coincap.io/page/'+ symbol, true );
   xhr.setRequestHeader( 'X-Requested-With', 'XMLHttpRequest' );
   xhr.responseType = 'json';
   xhr.addEventListener( 'load', e => { 
    if ( !xhr.response || !xhr.response.id ) return;  
    let price  = parseFloat( xhr.response.price ) || 0; 
    let cap    = parseFloat( xhr.response.market_cap ) || 0; 
    let supply = parseFloat( xhr.response.supply ) || 0; 
    this.setStats( symbol, { price, cap, supply } ); 
   });
   xhr.send();
  }, 
 }, 
 
 // when component mounts 
 mounted() {
  this.selectWallet( this.tab ); 
 }, 
});