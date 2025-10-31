/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { FC } from 'react';
import React, { memo, useCallback, useMemo } from 'react';
import { EuiPanel, useEuiTheme } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { css } from '@emotion/react';
import { useFlyoutApi } from '@kbn/flyout';
import { PREFIX } from '../../shared/test_ids';
import type { DocumentDetailsProps } from '../shared/types';
import { SourcererScopeName } from '../../../sourcerer/store/model';
import { useWhichFlyout } from '../shared/hooks/use_which_flyout';
import { useDocumentDetailsContext } from '../shared/context';
import { Resolver } from '../../../resolver/view';
import { useTimelineDataFilters } from '../../../timelines/containers/use_timeline_data_filters';
import { isActiveTimeline } from '../../../helpers';
import { DocumentDetailsAnalyzerPanelKeyV2 } from '../shared/constants/panel_keys';
import { useIsInvestigateInResolverActionEnabled } from '../../../detections/components/alerts_table/timeline_actions/investigate_in_resolver';
import { AnalyzerPreviewNoDataMessage } from '../right/components/analyzer_preview_container';
import { useSelectedPatterns } from '../../../data_view_manager/hooks/use_selected_patterns';
import { useSourcererDataView } from '../../../sourcerer/containers';
import { useIsExperimentalFeatureEnabled } from '../../../common/hooks/use_experimental_features';
import { FlyoutBody } from '../../shared/components/flyout_body';

const ANALYZER_GRAPH_TEST_ID = `${PREFIX}AnalyzerGraph` as const;

const ANALYZER_PREVIEW_BANNER = {
  title: i18n.translate(
    'xpack.securitySolution.flyout.left.visualizations.analyzer.panelPreviewTitle',
    {
      defaultMessage: 'Preview analyzer panel',
    }
  ),
  backgroundColor: 'warning',
  textColor: 'warning',
};

export const AnalyzerMainPanel: FC<Partial<DocumentDetailsProps>> = memo(() => {
  const { euiTheme } = useEuiTheme();

  const { eventId, scopeId, dataAsNestedObject } = useDocumentDetailsContext();
  const isEnabled = useIsInvestigateInResolverActionEnabled(dataAsNestedObject);

  const key = useWhichFlyout() ?? 'memory';
  const { from, to, shouldUpdate } = useTimelineDataFilters(isActiveTimeline(scopeId));
  const filters = useMemo(() => ({ from, to }), [from, to]);

  const newDataViewPickerEnabled = useIsExperimentalFeatureEnabled('newDataViewPickerEnabled');
  const { selectedPatterns: oldAnalyzerPatterns } = useSourcererDataView(
    SourcererScopeName.analyzer
  );
  const experimentalAnalyzerPatterns = useSelectedPatterns(SourcererScopeName.analyzer);
  const selectedPatterns = newDataViewPickerEnabled
    ? experimentalAnalyzerPatterns
    : oldAnalyzerPatterns;

  const { openChildPanel } = useFlyoutApi();

  const onClick = useCallback(() => {
    openChildPanel(
      {
        id: DocumentDetailsAnalyzerPanelKeyV2,
        params: {
          resolverComponentInstanceID: `${key}-${scopeId}`,
          banner: ANALYZER_PREVIEW_BANNER,
        },
      },
      's'
    );
  }, [openChildPanel, key, scopeId]);

  return (
    <FlyoutBody
      css={css`
        background-color: ${euiTheme.colors.backgroundBaseSubdued};
      `}
    >
      {isEnabled ? (
        <div data-test-subj={ANALYZER_GRAPH_TEST_ID}>
          <Resolver
            databaseDocumentID={eventId}
            resolverComponentInstanceID={`${key}-${scopeId}`}
            indices={selectedPatterns}
            shouldUpdate={shouldUpdate}
            filters={filters}
            isSplitPanel
            showPanelOnClick={onClick}
          />
        </div>
      ) : (
        <EuiPanel hasShadow={false}>
          <AnalyzerPreviewNoDataMessage />
        </EuiPanel>
      )}
    </FlyoutBody>
  );
});

AnalyzerMainPanel.displayName = 'AnalyzerMainPanel';
