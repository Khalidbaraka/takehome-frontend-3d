import $ from 'jquery'
import '../styles/app.css'

export function createLayout(root = document.body) {
  let $toolbar = $('<nav>').addClass('top-toolbar')
  let $mainContainer = $('<div>').addClass('main-container')

  let $leftBar = $('<div>').attr('id', 'shape-panel').addClass('left-bar')
  let $centerArea = $('<main>').attr('id', 'main-view').addClass('center-area')
  let $rightBar = $('<div>')
    .attr('id', 'shape-properties')
    .addClass('right-bar')
    .text('Project name + list of 3D objects')

  $mainContainer.append($leftBar, $centerArea, $rightBar)
  $(root).append($toolbar, $mainContainer)
}
