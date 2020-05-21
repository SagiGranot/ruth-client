import { Component } from "react";
import { loadModules } from "esri-loader";

export class ObjectEditor extends Component {
  componentDidMount() {
    loadModules(["esri/widgets/Editor", "esri/widgets/Expand"], {
      css: false,
    }).then(([Editor, Expand]) => {
      this.props.view.when(() => {
        // this.props.view.popup.autoOpenEnabled = false;
        const editor = new Editor({
          view: this.props.view,
        });

        const expand = new Expand({
          expandTooltip: "Expand object editor widget",
          view: this.props.view,
          content: editor,
          expanded: false,
        });

        this.props.view.ui.add(expand, "top-right");
      });
    });
  }

  render() {
    return null;
  }
}
