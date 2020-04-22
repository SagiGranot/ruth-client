import { Component } from 'react';
import { loadModules } from 'esri-loader';

export class ObjectEditor extends Component {
  componentDidMount() {
    loadModules(['esri/widgets/Editor'], {
      css: true,
    }).then(([Editor]) => {
      this.props.view.when(() => {
        // this.props.view.popup.autoOpenEnabled = false;
        let editor = new Editor({
          view: this.props.view,
        });
        this.props.view.ui.add(editor, 'top-right');
      });
    });
  }

  render() {
    return null;
  }
}
