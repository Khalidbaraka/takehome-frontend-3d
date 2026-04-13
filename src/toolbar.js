import $ from 'jquery'
import '../styles/toolbar.css'
import { getNotificationCenter } from './notification'

export function createToolbar(root = document) {
  const toolbar = $(root).find('.top-toolbar')
  const name = $('<h2>').addClass('project-name').text('Project')
  const changeNameBtn = $('<button>')
    .text('Change name')
    .on('click', () => {
      const newName = prompt('Enter new name', name.text())
      name.text(newName)
      getNotificationCenter().notify('projectName', newName)
    })

  toolbar.append(
    name,
    changeNameBtn,
    $('<div>').attr('id', 'react-toolbar-root')
  )
}
