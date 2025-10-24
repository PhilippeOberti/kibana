/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { GenericEntityPanelExpandableFlyoutProps } from '../generic_right';
import { EntityType } from '../../../../common/entity_analytics/types';
import type { HostPanelExpandableFlyoutProps } from '../host_right';
import type { ServicePanelExpandableFlyoutProps } from '../service_right';
import type { UserPanelExpandableFlyoutProps } from '../user_right';

export const ONE_WEEK_IN_HOURS = 24 * 7;

export const getEntraUserIndex = (spaceId: string = 'default') =>
  `logs-entityanalytics_entra_id.user-${spaceId}`;

export const ENTRA_ID_PACKAGE_NAME = 'entityanalytics_entra_id';

export const getOktaUserIndex = (spaceId: string = 'default') =>
  `logs-entityanalytics_okta.user-${spaceId}`;

export const OKTA_PACKAGE_NAME = 'entityanalytics_okta';

export const MANAGED_USER_QUERY_ID = 'managedUserDetailsQuery';

export const HostPanelKeyV2: HostPanelExpandableFlyoutProps['key'] = 'host-panel-v2';
export const UserPanelKeyV2: UserPanelExpandableFlyoutProps['key'] = 'user-panel-v2';
export const ServicePanelKeyV2: ServicePanelExpandableFlyoutProps['key'] = 'service-panel-v2';
export const GenericEntityPanelKeyV2: GenericEntityPanelExpandableFlyoutProps['key'] =
  'generic-entity-panel-v2';

export const EntityPanelKeyByType: Record<EntityType, string | undefined> = {
  [EntityType.host]: HostPanelKeyV2,
  [EntityType.user]: UserPanelKeyV2,
  [EntityType.service]: ServicePanelKeyV2,
  [EntityType.generic]: undefined, // TODO create generic flyout?
};

// TODO rename all params and merged them as 'entityName'
export const EntityPanelParamByType: Record<EntityType, string | undefined> = {
  [EntityType.host]: 'hostName',
  [EntityType.user]: 'userName',
  [EntityType.service]: 'serviceName',
  [EntityType.generic]: undefined, // TODO create generic flyout?
};
