$(document).ready(function(){
    $('body').click(function(e){        
        if(!$(e.target).closest('.modalParent').length){
            var clickedOnMenuItem = $(e.target).closest('.menu_item.clickable');
            if(clickedOnMenuItem.length){
                var targetModal = clickedOnMenuItem.attr('href').replace('#','');
                $('.modalParent.rotateInUpLeft:not([id="'+targetModal+'"])').find('.modalClose').click();
                if(targetModal == $('.modalParent.rotateInUpLeft').attr('id')){
                    return;
                }
            }
            $('.modalParent.rotateInUpLeft .modalClose').click();
        }    
    });
    $("#works").animatedModal({
        animatedIn:'rotateInUpLeft',
        animatedOut:'rotateOutDownRight'
    });
    $("#skills").animatedModal({
        animatedIn:'rotateInUpLeft',
        animatedOut:'rotateOutDownRight'
    });
    $("#contact").animatedModal({
        animatedIn:'rotateInUpLeft',
        animatedOut:'rotateOutDownRight'
    });
});