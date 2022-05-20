// Copyright 2021 99cloud
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import globalContainersStore, {
  ContainersStore,
} from 'stores/barbican/containers';
import { checkPolicyRule } from 'resources/skyline/policy';
import globalSecretsStore, { SecretsStore } from 'stores/barbican/secrets';
import { certificateMode, certificateStatus } from 'resources/octavia/lb';
import { getOptions } from 'utils/index';
import { parse } from 'qs';
import actionConfigs from './actions';

export class Certificate extends Base {
  init() {
    if (this.currentMode === 'SERVER') {
      this.store = globalContainersStore;
      this.downloadStore = new ContainersStore();
    } else {
      this.store = globalSecretsStore;
      this.downloadStore = new SecretsStore();
    }
  }

  get policy() {
    return ['containers:get', 'secrets:get'];
  }

  get showDetail() {
    return checkPolicyRule('secret:decrypt');
  }

  get name() {
    return t('certificate');
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return this.currentMode === 'SERVER'
        ? actionConfigs.actionConfigsContainerAdmin
        : actionConfigs.actionConfigsSecretAdmin;
    }
    return this.currentMode === 'SERVER'
      ? actionConfigs.actionConfigsContainer
      : actionConfigs.actionConfigsSecret;
  }

  get currentMode() {
    const params = parse(this.props.location.search.slice(1));
    const { tab = 'SERVER' } = params;
    return tab;
  }

  get routeLinkPath() {
    return this.currentMode === 'SERVER'
      ? 'certificateContainerDetail'
      : 'certificateSecretDetail';
  }

  updateFetchParams = (params) => {
    return {
      ...params,
      mode: this.currentMode,
    };
  };

  getColumns = () => {
    const columns = [
      {
        title: this.showDetail ? t('ID/Name') : t('Name'),
        dataIndex: 'name',
        routeName: this.showDetail
          ? this.getRouteName(this.routeLinkPath)
          : null,
      },
      {
        title: t('Certificate Type'),
        dataIndex: 'mode',
        render: (value) => certificateMode[value] || value,
      },
      {
        title: t('Expires At'),
        dataIndex: 'expiration',
        valueRender: 'toLocalTime',
      },
      {
        title: t('Domain Name'),
        dataIndex: 'algorithm',
        render: (value) => value || '-',
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        render: (value) => certificateStatus[value] || value,
      },
      {
        title: t('Created At'),
        dataIndex: 'created',
        valueRender: 'toLocalTime',
      },
    ];
    return columns;
  };

  get searchFilters() {
    const ret = [
      {
        label: t('Name'),
        name: 'name',
      },
      {
        label: t('Certificate Type'),
        name: 'mode',
        options: getOptions(certificateMode),
      },
    ];
    return ret;
  }
}

export default inject('rootStore')(observer(Certificate));