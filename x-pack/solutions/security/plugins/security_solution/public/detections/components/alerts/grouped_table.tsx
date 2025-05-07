/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback, useMemo } from 'react';
import type { Filter } from '@kbn/es-query';
import { TableId } from '@kbn/securitysolution-data-table';
import type { RunTimeMappings } from '@kbn/timelines-plugin/common/search_strategy';
import { useGroupTakeActionsItems } from '../../hooks/alerts_table/use_group_take_action_items';
import {
  defaultGroupingOptions,
  defaultGroupStatsAggregations,
  defaultGroupStatsRenderer,
  defaultGroupTitleRenderers,
} from '../../components/alerts_table/grouping_settings';
import { useIsExperimentalFeatureEnabled } from '../../../common/hooks/use_experimental_features';
import type { AssigneesIdsSelection } from '../../../common/components/assignees/types';
import { useDataTableFilters } from '../../../common/hooks/use_data_table_filters';
import { useDeepEqualSelector } from '../../../common/hooks/use_selector';
import { useGlobalTime } from '../../../common/containers/use_global_time';
import { inputsSelectors } from '../../../common/store/inputs';
import { useUserData } from '../../components/user_info';
import { useListsConfig } from '../../containers/detection_engine/lists/use_lists_config';
import {
  buildAlertAssigneesFilter,
  buildShowBuildingBlockFilter,
  buildThreatMatchFilter,
} from '../../components/alerts_table/default_config';
import { useSourcererDataView } from '../../../sourcerer/containers';
import { SourcererScopeName } from '../../../sourcerer/store/model';
import type { Status } from '../../../../common/api/detection_engine';
import { GroupedAlertsTable } from '../../components/alerts_table/alerts_grouping';
import { DetectionEngineAlertsTable } from '../../components/alerts_table';
import { useDataViewSpec } from '../../../data_view_manager/hooks/use_data_view_spec';

export interface GroupedTableProps {
  /**
   *
   */
  assignees: AssigneesIdsSelection[];
  /**
   *
   */
  detectionPageFilters: Filter[] | undefined;
  /**
   *
   */
  statusFilter: Status[];
}

/**
 *
 */
export const GroupedTable = memo(
  ({ assignees, detectionPageFilters, statusFilter }: GroupedTableProps) => {
    const getGlobalFiltersQuerySelector = useMemo(
      () => inputsSelectors.globalFiltersQuerySelector(),
      []
    );
    const globalFilters = useDeepEqualSelector(getGlobalFiltersQuerySelector);

    const getGlobalQuerySelector = useMemo(() => inputsSelectors.globalQuerySelector(), []);
    const query = useDeepEqualSelector(getGlobalQuerySelector);

    const { to, from } = useGlobalTime();

    const [{ loading: userInfoLoading, signalIndexName, hasIndexWrite, hasIndexMaintenance }] =
      useUserData();

    const { loading: listsConfigLoading } = useListsConfig();

    const { sourcererDataView: oldSourcererDataView } = useSourcererDataView(
      SourcererScopeName.detections
    );
    const newDataViewPickerEnabled = useIsExperimentalFeatureEnabled('newDataViewPickerEnabled');
    const { dataViewSpec: experimentalDataViewSpec } = useDataViewSpec(
      SourcererScopeName.detections
    );
    const sourcererDataView = newDataViewPickerEnabled
      ? experimentalDataViewSpec
      : oldSourcererDataView;

    const { showBuildingBlockAlerts, showOnlyThreatIndicatorAlerts } = useDataTableFilters(
      TableId.alertsOnAlertsPage
    );

    // AlertsTable manages global filters itself, so not including `filters`
    const defaultFilters = useMemo(
      () => [
        ...buildShowBuildingBlockFilter(showBuildingBlockAlerts),
        ...buildThreatMatchFilter(showOnlyThreatIndicatorAlerts),
        ...(detectionPageFilters ?? []),
        ...buildAlertAssigneesFilter(assignees),
      ],
      [assignees, showBuildingBlockAlerts, showOnlyThreatIndicatorAlerts, detectionPageFilters]
    );

    const isLoading = useMemo(
      () => userInfoLoading || listsConfigLoading || !Array.isArray(detectionPageFilters),
      [detectionPageFilters, listsConfigLoading, userInfoLoading]
    );

    const renderAlertTable = useCallback(
      (groupingFilters: Filter[]) => {
        return (
          <DetectionEngineAlertsTable
            tableType={TableId.alertsOnAlertsPage}
            inputFilters={[...defaultFilters, ...groupingFilters]}
            isLoading={isLoading}
          />
        );
      },
      [defaultFilters, isLoading]
    );

    const groupTakeActionItems = useGroupTakeActionsItems({
      currentStatus: statusFilter,
      showAlertStatusActions: Boolean(hasIndexWrite) && Boolean(hasIndexMaintenance),
    });

    const accordionExtraActionGroupStats = useMemo(
      () => ({
        aggregations: defaultGroupStatsAggregations,
        renderer: defaultGroupStatsRenderer,
      }),
      []
    );

    return (
      <GroupedAlertsTable
        accordionButtonContent={defaultGroupTitleRenderers}
        accordionExtraActionGroupStats={accordionExtraActionGroupStats}
        defaultFilters={defaultFilters}
        defaultGroupingOptions={defaultGroupingOptions}
        from={from}
        globalFilters={globalFilters}
        globalQuery={query}
        groupTakeActionItems={groupTakeActionItems}
        loading={isLoading}
        renderChildComponent={renderAlertTable}
        runtimeMappings={sourcererDataView.runtimeFieldMap as RunTimeMappings}
        signalIndexName={signalIndexName}
        tableId={TableId.alertsOnAlertsPage}
        to={to}
      />
    );
  }
);

GroupedTable.displayName = 'GroupedTable';
