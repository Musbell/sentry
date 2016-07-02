import React from 'react';
import ApiMixin from '../mixins/apiMixin';
import {BooleanField, Form, TextareaField, TextField} from '../components/forms';
import GroupState from '../mixins/groupState';
import {t} from '../locale';

const IssuePlugin = React.createClass({
  mixins: [
    ApiMixin,
    GroupState
  ],

  getInitialState() {
    return {
      createFieldList: null,
      linkFieldList: null,
      createIssue: true,
      loading: true,
      error: false,
      createFormData: {},
      linkFormData: {}
    };
  },

  componentWillMount() {
    // TODO: does this need to work with multiple plugins?
    let group = this.getGroup();
    let plugin = group.pluginIssues && group.pluginIssues[0];
    if (group.pluginIssues && group.pluginIssues.length) {
      if (!plugin.issue) {
        this.fetchData(group.pluginIssues[0].slug);
      }
    }
  },

  getPluginCreateEndpoint(pluginSlug) {
    return '/issues/' + this.getGroup().id + '/plugin/create/github/';
  },

  getPluginLinkEndpoint(pluginSlug) {
    return '/issues/' + this.getGroup().id + '/plugin/link/github/';
  },

  getPluginUnlinkEndpoint(pluginSlug) {
    return '/issues/' + this.getGroup().id + '/plugin/unlink/github/';
  },

  fetchData(pluginSlug) {
    this.setState({
      loading: true,
      error: false
    });

    this.api.request(this.getPluginCreateEndpoint(), {
      success: (data) => {
        debugger;
        if (!this.isMounted()) {
          return;
        }
        let createFormData = {};
        data.forEach((field) => {
          createFormData[field.label] = field.default;
        });
        this.setState({
          createFieldList: data,
          error: false,
          loading: false,
          createFormData: createFormData
        });
      },
      error: (error) => {
        if (!this.isMounted()) {
          return;
        }
        this.setState({
          error: true,
          loading: false
        });
      }
    });

    this.api.request(this.getPluginLinkEndpoint(), {
      success: (data) => {
        debugger;
        if (!this.isMounted()) {
          return;
        }
        let linkFormData = {};
        data.forEach((field) => {
          linkFormData[field.label] = field.default;
        });
        this.setState({
          linkFieldList: data,
          error: false,
          loading: false,
          linkFormData: linkFormData
        });
      },
      error: (error) => {
        if (!this.isMounted()) {
          return;
        }
        this.setState({
          error: true,
          loading: false
        });
      }
    });
  },

  createIssue() {
    this.api.request(this.getPluginCreateEndpoint(), {
      data: this.state.createFormData,
      success: (data) => {
        // TODO
      },
      error: (error) => {
        // TODO
      }
    });
  },

  linkIssue() {
    this.api.request(this.getPluginLinkEndpoint(), {
      data: this.state.createFormData,
      success: (data) => {
        // TODO
      },
      error: (error) => {
        // TODO
      }
    });
  },

  unlinkIssue() {
    this.api.request(this.getPluginUnlinkEndpoint(), {
      success: (data) => {
        // TODO
      },
      error: (error) => {
        // TODO
      }
    });
  },

  changeField(action, label, value) {
    let key = action + 'FormData';
    let formData = this.state[key];
    formData[label] = value;
    let state = {};
    state[key] = formData;
    this.setState(state);
  },

  renderField(action, field) {
    let el;
    let props = {
      value: this.state.formData[field.label],
      onChange: this.changeField.bind(this, action, field.label),
      label: field.label,
      key: field.label,
      name: field.label
    };
    switch (field.type) {
      case 'text':
        el = <TextField {...props} />;
        break;
      case 'textarea':
        el = <TextareaField {...props} />;
        break;
      default:
        el = null;
    }
    return el;
  },

  toggleIssueForm(value) {
    this.setState({createIssue: value});
  },

  renderForm() {
    return (
      <div>
        <div>
          <BooleanField label={t('Create new issue')}
                        name="is_create"
                        value={this.state.createIssue}
                        onChange={this.toggleIssueForm}/>
        </div>
        {this.state.createIssue ?
          <Form onSubmit={this.createIssue}>
            {this.state.createFieldList.map((field) => {
              return this.renderField('create', field);
            })}
          </Form> :
          <Form onSubmit={this.linkIssue}>
            {this.state.linkFormData.map((field) => {
              return this.renderField('link', field);
            })}
          </Form>
        }
      </div>
    );
  },

  render() {
    // TODO: does this need to work with multiple plugins?
    let group = this.getGroup();
    let plugin = group.pluginIssues && group.pluginIssues[0];
    // debugger;
    if (plugin.issue) {
      return (
        <div>
          <a href={plugin.issue.url} target="_blank">{plugin.issue.label}</a>
          {plugin.can_unlink &&
            <button className="btn btn-primary"
                    onClick={this.unlinkIssue}>{t('Unlink')}</button>}
        </div>);
    }
    if (!(this.state.createFieldList || (plugin.can_link_existing && !this.state.linkFieldList))) {
      // TODO: loading
      return null;
    }
    return this.renderForm();
  }
});

export default IssuePlugin;
