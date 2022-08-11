
$(document).ready(function(){
  $('#game_verify_submit').trigger('click'); 
  console.log("verified");
});

// This will be the client seed of block 637645
const SALT = '00000000000000000000cd2bcb44f656649c69d8b17ade0399168f3cbe859d26';
let isVerifying = false;
$('#game_verify_submit').on('click', () => {
  if (isVerifying) return;
  
  isVerifying = true;
  $('#game_hash_input').parent().addClass('is-loading');
  $('#game_verify_submit').addClass('is-loading');
  $('#game_hash_input, #game_amount_input, #game_verify_submit').attr('disabled', 'disabled');
  $('#game_verify_table').html('');

	const numberOfGames = $('#game_amount_input').val();
  let hash = $('#game_hash_input').val();
  for (let i = 0; i < numberOfGames; i++) {
    const bust = gameResult(hash);
      addTableRow(hash, bust, i);
  	hash = String(CryptoJS.SHA256(hash));
  }
});

$('#game_amount_input').on('keyup', () => {
  if ($('#game_amount_input').val() >= 10000) {
    if ($('#game_verify_warning').length) return;
    $('#game_verify_submit').parent().append(
      $('<span/>').attr({
        'id': 'game_verify_warning',
        'class': 'tag is-warning'
      }).text("Verifying a huge amount of games may consume more ressources from your CPU")
    );
  } else {
    if ($('#game_verify_warning').length) {
      $('#game_verify_warning').remove();
    }
  }
});

const addTableRow = (hash, bust, index) => {
  $('<tr/>').attr({
    'class': index === 0 ? 'is-first' : null
  }).append(
    $('<td/>').text(hash)
  ).append(
    $('<td/>').text(bust).attr({
      'class': bust === 1.98 ? 'is-at-median' : bust > 1.98 ? 'is-over-median' : 'is-under-median'
    })
  ).appendToWithIndex($('#game_verify_table'), index);

  if (index >= $('#game_amount_input').val() - 1) {
    $('#game_hash_input').parent().removeClass('is-loading');
    $('#game_verify_submit').removeClass('is-loading');
    $('#game_hash_input, #game_amount_input, #game_verify_submit').removeAttr("disabled");
    isVerifying = false;
  }
};

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}


let hash = getUrlVars()["hash"];

if(hash){
  $('#game_hash_input').val($('#game_hash_input').val() + hash);
}

/**
  * @desc Calculates the game result from its hash
  * @param binary seed - Hash of the game. Ex.: Buffer.from(seed)
  * @param string salt - Client seed; A bitcoin block hash
  * @return number
*/
const gameResult = (hash) => {

  console.log("hash", hash)
  // const nBits = 52; // number of most significant bits to use

	// // 1. HMAC_SHA256(message=seed, key=salt)
	// const hash = CryptoJS.HmacSHA256(seed).toString();

	// // 2. r = 52 most significant bits
	// const r = parseInt(hash.slice(0, nBits / 4), 16);

	// // 3. X = r / 2^52
	// const X = r / Math.pow(2, nBits); // uniformly distributed in [0; 1)

	// // 4. X = 90 / (1-X)
	// const result = Math.floor(90 / (1 - X));

	// // 5. return capped to 1 on lower end
  let newHash = hash.slice(0,8)

  console.log("new hash", newHash)

  const crashPoint =
    Math.round((4294967296 / (parseInt(newHash, 16) + 1)) * (1 - 0.02) * 100) /
    100;

    console.log("crash point",crashPoint)

  return crashPoint < 1 ? 1 : crashPoint;
};

$.fn.appendToWithIndex = function(to, index) {
  if (!to instanceof jQuery) {
    to = $(to);
  }
  if (index === 0) {
    $(this).prependTo(to);
  } else {
    $(this).insertAfter(to.children().eq(index - 1));
  }
};
