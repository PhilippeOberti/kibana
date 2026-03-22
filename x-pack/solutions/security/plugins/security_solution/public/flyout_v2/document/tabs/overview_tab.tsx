/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback } from 'react';
import { EuiButtonEmpty, EuiHorizontalRule, EuiPanel } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import type { DataTableRecord } from '@kbn/discover-utils';
import { useHistory } from 'react-router-dom';
import { useStore } from 'react-redux';
import { AboutSection } from '../components/about_section';
import { InsightsSection } from '../components/insights_section';
import { InvestigationSection } from '../components/investigation_section';
import { VisualizationsSection } from '../components/visualizations_section';
import type { ResolverCellActionRenderer } from '../../../resolver/types';
import { useKibana } from '../../../common/lib/kibana';
import { NotesDetails } from '../../notes';
import { flyoutProviders } from '../../shared/components/flyout_provider';

const OVERVIEW_ARIA_LABEL = i18n.translate(
  'xpack.securitySolution.flyout.document.overview.overviewContentAriaLabel',
  { defaultMessage: 'Overview' }
);

export interface OverviewTabProps {
  /**
   * Document to display in the overview tab
   */
  hit: DataTableRecord;
  /**
   * Pass cell action renderer to the analyzer graph in the visualizations section of the overview tab.
   */
  renderCellActions: ResolverCellActionRenderer;
}

const NOTES_BUTTON_LABEL = i18n.translate(
  'xpack.securitySolution.flyout.document.overview.notesButtonLabel',
  { defaultMessage: 'Notes' }
);

/**
 * Overview view displayed in the document details expandable flyout right section
 */
export const OverviewTab = memo(({ hit, renderCellActions }: OverviewTabProps) => {
  console.log('test');
  const { services } = useKibana();
  const { overlays } = services;
  const store = useStore();
  const history = useHistory();

  const onShowNotes = useCallback(() => {
    overlays.openSystemFlyout(
      flyoutProviders({
        services,
        store,
        history,
        children: <NotesDetails hit={hit} />,
      }),
      {
        ownFocus: false,
        resizable: true,
        size: 'm',
        type: 'overlay',
      }
    );
  }, [history, hit, overlays, services, store]);

  return (
    <EuiPanel hasBorder={false} hasShadow={false} aria-label={OVERVIEW_ARIA_LABEL}>
      <EuiButtonEmpty iconType="editorComment" onClick={onShowNotes} size="s">
        {NOTES_BUTTON_LABEL}
      </EuiButtonEmpty>
      <EuiHorizontalRule margin="s" />
      <AboutSection hit={hit} />
      <EuiHorizontalRule margin="m" />
      <InvestigationSection hit={hit} />
      <EuiHorizontalRule margin="m" />
      <VisualizationsSection hit={hit} renderCellActions={renderCellActions} />
      <EuiHorizontalRule margin="m" />
      <InsightsSection hit={hit} />
    </EuiPanel>
  );
});

OverviewTab.displayName = 'OverviewTab';
