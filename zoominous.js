/* global jQuery, imagesLoaded, Hammer, console */

;(function($){

  "use strict";

  $.fn.zoominous = function(options){

    var defaults = {
      namespace: "zoominous"
    }
    var settings = $.extend(defaults, options)

    return this.each(function(){

      var $this = $(this),
          $fullscreenView = $this.find('.' + settings.namespace + '-fullscreen'),
          $img = $fullscreenView.find('img').first(),
          $closeButton = $fullscreenView.find('.' + settings.namespace + '-close-wrapper'),
          active = false, scaleActive = false,
          dragStartLeft, dragStartTop,
          scaleStart, currentScale, closeTimer,
          winWidth, winHeight, imgWidth, imgHeight,
          imgLeft, imgTop, imgAR, winAR

      function initializeToFrame(){
        imgWidth = $img.width()
        imgHeight = $img.height()
        winHeight = $(window).height()
        winWidth = $(window).width()
        imgAR = imgWidth / imgHeight
        winAR = winWidth / winHeight

        if (imgAR > winAR) {
          imgWidth = winWidth
          $img.width(imgWidth)
          $img.height('auto')
          imgHeight = $img.height()
          imgLeft = 0
          imgTop = (winHeight - $img.height()) / 2
        } else {
          imgHeight = winHeight
          $img.height(imgHeight)
          $img.width('auto')
          imgWidth = $img.width()
          imgTop = 0
          imgLeft = (winWidth - $img.width()) / 2
        }

       currentScale = 1
       moveImage(imgLeft, imgTop)
      }

      function scaleImage(scale, centerX, centerY){
        var oldWidth = imgWidth,
            oldHeight = imgHeight

        if (imgAR > winAR) {
          imgWidth = winWidth * scale
          $img.width(imgWidth)
          imgHeight = $img.height()
        } else {
          imgHeight = winHeight * scale
          $img.height(imgHeight)
          $img.width('auto')
          imgWidth = $img.width()
        }

        // Determine the location of the touch centerpoint within the image
        var xPoint = oldWidth / (centerX - imgLeft),
            yPoint = oldHeight / (centerY - imgTop)

        // Calculate the image's new location,
        // based on size and position of touch centerpoint
        var newLeft = imgLeft - (imgWidth - oldWidth) / xPoint,
            newTop = imgTop - (imgHeight - oldHeight) / yPoint

        moveImage(newLeft, newTop)
      }

      function moveImage(offsetX, offsetY){
        $img.css({
          y: offsetY,
          x: offsetX
        })
        imgLeft = offsetX
        imgTop = offsetY
      }

      function moveImageAnimated(offsetX, offsetY){
        $img.stop().transition({
          y: offsetY,
          x: offsetX
        }, 300)
        imgLeft = offsetX
        imgTop = offsetY
      }

      function snapToFrame(){
        var imgBottom = imgTop + imgHeight,
            imgRight = imgLeft + imgWidth

        // If the image is narrower than the window, center horizontally
        if (imgWidth < winWidth) {
          imgLeft = (winWidth - imgWidth) / 2
        } else {
          // If the image is beyond the left edge,
          // and there is space to the right,
          // move the right of the image to the right of the screen
          if (imgLeft < 0 && imgRight < winWidth) {
            imgLeft = (winWidth - imgWidth)
          }
          // If the image is beyond the right edge,
          // and there is space to the left,
          // move the left of the image to the left of the screen
          if (imgRight > winWidth && imgLeft > 0) {
            imgLeft = 0
          }
        }

        // If the image is shorter than the window, center vertically
        if (imgHeight < winHeight){
          imgTop = (winHeight - imgHeight) / 2
        } else {
          // If the image is above the top of the screen,
          // and there is space below it,
          // move the bottom of the image to the bottom of the screen
          if (imgTop < 0 && imgBottom < winHeight) {
            imgTop = (winHeight - imgHeight)
          }
          // If the image is below the bottom of the screen,
          // and there is space above it,
          // move the top of the image to the top of the screen
          if (imgBottom > winHeight && imgTop > 0) {
            imgTop = 0
          }
        }

        moveImageAnimated(imgLeft, imgTop)
      }

      function showCloseButton(){
        $closeButton.show().removeClass('hidden')
        clearInterval(closeTimer)
        closeTimer = setTimeout(function(){
          hideCloseButton()
        }, 6000)
      }

      function hideCloseButton(){
        $closeButton.addClass('hidden')
      }

      function initialize(){
        $(window).resize(function(){
          if (active) {
            initializeToFrame()
          }
        })

        $this.click(function(){
          if (!active) {
            active = true

            if (!$img.attr('src')) {
              $img.attr('src', $img.data('src'))
            }

            $fullscreenView.imagesLoaded(function(){
              $fullscreenView.css('background-image', 'none')
              initializeToFrame(false)
            })

            $fullscreenView.fadeIn(400, function(){
              $img.show()
              showCloseButton()
            })
          }

        })

        var fullScreenHammer = new Hammer($fullscreenView[0])
          .on('touch', function(e){
            e.gesture.preventDefault()
          })
          .on('doubletap', function(e){
            e.gesture.preventDefault()
            e.gesture.stopDetect()
            initializeToFrame()
            showCloseButton()
          })
          .on('tap', function(e){
            e.gesture.preventDefault()
            if ($closeButton.hasClass('hidden')) {
              showCloseButton()
            } else {
              hideCloseButton()
            }
          })

        var closeHammer = new Hammer($closeButton[0])
          .on('touch', function(e){
            if (!$closeButton.hasClass('hidden')) {
              $(window).off('resize.zoominous')
              $closeButton.hide()
              $fullscreenView.fadeOut(function(){
                active = false
              })
            }
          })

        var imgHammer = new Hammer($img[0], {
          transform_always_block: true
        })
          .on('dragstart', function(e){
            e.gesture.preventDefault()
            dragStartLeft = imgLeft
            dragStartTop = imgTop
          })
          .on('drag', function(e){
            if (e.gesture && !scaleActive) {
              e.gesture.preventDefault()

              if (imgWidth > winWidth){
                imgLeft = dragStartLeft + e.gesture.deltaX
              }
              if (imgHeight > winHeight){
                imgTop = dragStartTop + e.gesture.deltaY
              }

              moveImage(imgLeft, imgTop)
            }
          })
          .on('dragend', function(e){
            if (e.gesture && !scaleActive) {
              e.gesture.preventDefault()
              snapToFrame()
            }
          })
          .on('transformstart', function(e){
            scaleStart = currentScale
            scaleActive = true
          })
          .on('transform', function(e){
            e.gesture.preventDefault()
            currentScale = e.gesture.scale * scaleStart
            if (currentScale > 5) {
              currentScale = 5
            } else if (currentScale < 1) {
              currentScale = 1
            }
            scaleImage(
              currentScale,
              e.gesture.center.pageX,
              e.gesture.center.pageY - $(window).scrollTop()
            )
          })
          .on('transformend', function(e){
            e.gesture.preventDefault()
            scaleActive = false
            snapToFrame()

          })
          .on('touch', function(e){
            e.gesture.preventDefault()
          })

      }

      initialize()

    })
  }

})(jQuery)
