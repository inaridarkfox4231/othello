$(function(){
  // 変数の用意
  const BLACK = 1;
  const WHITE = 2;

  // board生成のコード↓
  var text_board = '';
  for(var i = 0; i < 8; i++){
    var text_row = ''
    for(var j = 0; j < 8; j++){
      var text_cell = '<td class = "cell" id = "cell' + i + j + '"><span class = "tip"></span></td>';
      text_row += text_cell;
    }
    text_board += '<tr>' + text_row + '</tr>';
  }
  $('#board').html(text_board);

  // クリックすると黒チップが置かれる↓
  $('.cell').click(function(){
    var $span = $(this).children('span');
    if($span.hasClass('black')){
      $span.removeClass('black');
    }else{
      $span.addClass('black');
    }
  });

  // ableに対応する処置としてはClass: ableを付与したり外したりすることで表現する。
  // つまり、ableなら付けて色を変え、再計算の時はいっせいに外す。


});
