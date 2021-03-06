import React from 'react';
import GroupEventDataSection from '../eventDataSection';
import PropTypes from '../../../proptypes';
import RichHttpContent from './richHttpContent';
import {getCurlCommand} from './utils';
import {t} from '../../../locale';

import RequestActions from './requestActions';
import Truncate from '../../../components/truncate';

const RequestInterface = React.createClass({
  propTypes: {
    group: PropTypes.Group.isRequired,
    event: PropTypes.Event.isRequired,
    type: React.PropTypes.string.isRequired,
    data: React.PropTypes.object.isRequired,
    isShare: React.PropTypes.bool
  },

  contextTypes: {
    organization: PropTypes.Organization,
    project: PropTypes.Project
  },

  getInitialState() {
    return {
      view: 'rich'
    };
  },

  isPartial() {
    // We assume we only have a partial interface is we're missing
    // an HTTP method. This means we don't have enough information
    // to reliably construct a full HTTP request.
    return !this.props.data.method;
  },

  toggleView(value) {
    this.setState({
      view: value
    });
  },

  render() {
    let group = this.props.group;
    let evt = this.props.event;
    let data = this.props.data;
    let view = this.state.view;

    let fullUrl = data.url;
    if (data.query) {
      fullUrl = fullUrl + '?' + data.query;
    }
    if (data.fragment) {
      fullUrl = fullUrl + '#' + data.fragment;
    }

    // lol
    let parsedUrl = document.createElement('a');
    parsedUrl.href = fullUrl;

    let children = [];

    if (!this.isPartial()) {
      children.push(
        <div key="action-buttons" className="pull-right">
          {!this.props.isShare &&
            <RequestActions organization={this.context.organization}
                            project={this.context.project}
                            group={group}
                            event={evt} />
          }
        </div>,
        <div key="view-buttons" className="btn-group">
          <a className={(view === 'rich' ? 'active' : '') + ' btn btn-default btn-sm'}
            onClick={this.toggleView.bind(this, 'rich')}>{
              /* Translators: this means "rich" rendering (fancy tables) */
              t('Rich')}</a>
          <a className={(view === 'curl' ? 'active' : '') + ' btn btn-default btn-sm'}
             onClick={this.toggleView.bind(this, 'curl')}><code>{'curl'}</code></a>
        </div>
      );
    }

    children.push(
      <h3 key="title">
        <a href={fullUrl} title={fullUrl}>
          <span className="path"><strong>{data.method || 'GET'}</strong>
            <Truncate value={parsedUrl.pathname} maxLength={36} leftTrim={true} />
          </span>
          <span className="external-icon">
            <em className="icon-open" />
          </span>
        </a>
        <small style={{marginLeft: 10}} className="host">{parsedUrl.hostname}</small>
      </h3>
    );

    let title = (
      <div>{children}</div>
    );

    return (
      <GroupEventDataSection
          group={group}
          event={evt}
          type={this.props.type}
          title={title}
          wrapTitle={false}
          className="request">
        {view === 'curl' ?
          <pre>{getCurlCommand(data)}</pre>
        :
          <RichHttpContent data={data} />
        }
      </GroupEventDataSection>
    );
  }
});

export default RequestInterface;
