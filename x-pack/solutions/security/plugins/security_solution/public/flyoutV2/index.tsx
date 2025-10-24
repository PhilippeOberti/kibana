/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import type {
  FindingsMisconfigurationPanelExpandableFlyoutPropsNonPreview,
  FindingsMisconfigurationPanelExpandableFlyoutPropsPreview,
  FindingsVulnerabilityPanelExpandableFlyoutPropsNonPreview,
  FindingsVulnerabilityPanelExpandableFlyoutPropsPreview,
} from '@kbn/cloud-security-posture';
import type { GraphGroupedNodePreviewPanelProps } from '@kbn/cloud-security-posture-graph';
import { GraphGroupedNodePreviewPanelKey } from '@kbn/cloud-security-posture-graph';
import { Flyout } from '@kbn/flyout';
import type { GenericEntityDetailsExpandableFlyoutProps } from './entity_details/generic_details_left';
import {
  GenericEntityDetailsPanel,
  GenericEntityDetailsPanelKeyV2,
} from './entity_details/generic_details_left';
import type { GenericEntityPanelExpandableFlyoutProps } from './entity_details/generic_right';
import { GenericEntityPanel } from './entity_details/generic_right';
import type { EaseDetailsProps } from './ease/types';
import { EaseDetailsProvider } from './ease/context';
import { EasePanel } from './ease';
import { SessionViewPanelProvider } from './document_details/session_view/context';
import type { SessionViewPanelProps } from './document_details/session_view';
import { SessionViewPanel } from './document_details/session_view';
import type { NetworkExpandableFlyoutProps } from './network_details';
import { NetworkPanel, NetworkPanelKeyV2, NetworkPreviewPanelKeyV2 } from './network_details';
import {
  DocumentDetailsAlertReasonPanelKeyV2,
  DocumentDetailsAnalyzerPanelKeyV2,
  DocumentDetailsIsolateHostPanelKeyV2,
  DocumentDetailsLeftPanelKeyV2,
  DocumentDetailsPreviewPanelKeyV2,
  DocumentDetailsRightPanelKeyV2,
  DocumentDetailsSessionViewPanelKeyV2,
} from './document_details/shared/constants/panel_keys';
import type { IsolateHostPanelProps } from './document_details/isolate_host';
import { IsolateHostPanel } from './document_details/isolate_host';
import { IsolateHostPanelProvider } from './document_details/isolate_host/context';
import type { DocumentDetailsProps } from './document_details/shared/types';
import { DocumentDetailsProvider } from './document_details/shared/context';
import { RightPanel } from './document_details/right';
import { LeftPanel } from './document_details/left';
import { PreviewPanel } from './document_details/preview';
import type { AlertReasonPanelProps } from './document_details/alert_reason';
import { AlertReasonPanel } from './document_details/alert_reason';
import { AlertReasonPanelProvider } from './document_details/alert_reason/context';
import type { RulePanelExpandableFlyoutProps } from './rule_details/right';
import { RulePanel, RulePanelKeyV2, RulePreviewPanelKeyV2 } from './rule_details/right';
import type { UserPanelExpandableFlyoutProps } from './entity_details/user_right';
import { UserPanel, UserPreviewPanelKeyV2 } from './entity_details/user_right';
import type { UserDetailsExpandableFlyoutProps } from './entity_details/user_details_left';
import { UserDetailsPanel, UserDetailsPanelKeyV2 } from './entity_details/user_details_left';
import type { HostPanelExpandableFlyoutProps } from './entity_details/host_right';
import { HostPanel, HostPreviewPanelKeyV2 } from './entity_details/host_right';
import type { HostDetailsExpandableFlyoutProps } from './entity_details/host_details_left';
import { HostDetailsPanel, HostDetailsPanelKeyV2 } from './entity_details/host_details_left';
import type { AnalyzerPanelExpandableFlyoutProps } from './document_details/analyzer_panels';
import { AnalyzerPanel } from './document_details/analyzer_panels';
import {
  GenericEntityPanelKeyV2,
  HostPanelKeyV2,
  ServicePanelKeyV2,
  UserPanelKeyV2,
} from './entity_details/shared/constants';
import type { ServicePanelExpandableFlyoutProps } from './entity_details/service_right';
import { ServicePanel } from './entity_details/service_right';
import type { ServiceDetailsExpandableFlyoutProps } from './entity_details/service_details_left';
import {
  ServiceDetailsPanel,
  ServiceDetailsPanelKeyV2,
} from './entity_details/service_details_left';
import {
  MisconfigurationFindingsPanelKeyV2,
  MisconfigurationFindingsPreviewPanelKeyV2,
} from './csp_details/findings_flyout/constants';
import { FindingsMisconfigurationPanel } from './csp_details/findings_flyout/findings_right';
import { EasePanelKeyV2 } from './ease/constants/panel_keys';
import {
  VulnerabilityFindingsPanelKeyV2,
  VulnerabilityFindingsPreviewPanelKeyV2,
} from './csp_details/vulnerabilities_flyout/constants';
import { FindingsVulnerabilityPanel } from './csp_details/vulnerabilities_flyout/vulnerabilities_right';

const GraphGroupedNodePreviewPanel = React.lazy(() =>
  import('@kbn/cloud-security-posture-graph').then((module) => ({
    default: module.GraphGroupedNodePreviewPanel,
  }))
);

/**
 * List of all panels that will be used within the document details expandable flyout.
 * This needs to be passed to the expandable flyout registeredPanels property.
 */
const flyoutDocumentsPanels: FlyoutProps['registeredPanels'] = [
  {
    key: DocumentDetailsRightPanelKeyV2,
    component: (props) => (
      <DocumentDetailsProvider {...(props as DocumentDetailsProps).params}>
        <RightPanel path={props.path as DocumentDetailsProps['path']} />
      </DocumentDetailsProvider>
    ),
  },
  {
    key: DocumentDetailsLeftPanelKeyV2,
    component: (props) => (
      <DocumentDetailsProvider {...(props as DocumentDetailsProps).params}>
        <LeftPanel path={props.path as DocumentDetailsProps['path']} />
      </DocumentDetailsProvider>
    ),
  },
  {
    key: DocumentDetailsPreviewPanelKeyV2,
    component: (props) => (
      <DocumentDetailsProvider {...(props as DocumentDetailsProps).params}>
        <PreviewPanel path={props.path as DocumentDetailsProps['path']} />
      </DocumentDetailsProvider>
    ),
  },
  {
    key: DocumentDetailsAlertReasonPanelKeyV2,
    component: (props) => (
      <AlertReasonPanelProvider {...(props as AlertReasonPanelProps).params}>
        <AlertReasonPanel />
      </AlertReasonPanelProvider>
    ),
  },
  {
    key: GraphGroupedNodePreviewPanelKey,
    component: (props) => {
      // TODO Fix typing issue here
      const params = props.params as unknown as GraphGroupedNodePreviewPanelProps;
      return <GraphGroupedNodePreviewPanel {...params} />;
    },
  },
  {
    key: RulePanelKeyV2,
    component: (props) => <RulePanel {...(props as RulePanelExpandableFlyoutProps).params} />,
  },
  {
    key: RulePreviewPanelKeyV2,
    component: (props) => (
      <RulePanel {...(props as RulePanelExpandableFlyoutProps).params} isPreviewMode />
    ),
  },
  {
    key: DocumentDetailsIsolateHostPanelKeyV2,
    component: (props) => (
      <IsolateHostPanelProvider {...(props as IsolateHostPanelProps).params}>
        <IsolateHostPanel path={props.path as IsolateHostPanelProps['path']} />
      </IsolateHostPanelProvider>
    ),
  },
  {
    key: DocumentDetailsAnalyzerPanelKeyV2,
    component: (props) => (
      <AnalyzerPanel {...(props as AnalyzerPanelExpandableFlyoutProps).params} />
    ),
  },
  {
    key: DocumentDetailsSessionViewPanelKeyV2,
    component: (props) => (
      <SessionViewPanelProvider {...(props as SessionViewPanelProps).params}>
        <SessionViewPanel path={props.path as SessionViewPanelProps['path']} />
      </SessionViewPanelProvider>
    ),
  },
  {
    key: UserPanelKeyV2,
    component: (props) => <UserPanel {...(props as UserPanelExpandableFlyoutProps).params} />,
  },
  {
    key: UserDetailsPanelKeyV2,
    component: (props) => (
      <UserDetailsPanel {...(props as UserDetailsExpandableFlyoutProps).params} />
    ),
  },
  {
    key: UserPreviewPanelKeyV2,
    component: (props) => (
      <UserPanel {...(props as UserPanelExpandableFlyoutProps).params} isPreviewMode />
    ),
  },
  {
    key: HostPanelKeyV2,
    component: (props) => <HostPanel {...(props as HostPanelExpandableFlyoutProps).params} />,
  },
  {
    key: HostDetailsPanelKeyV2,
    component: (props) => (
      <HostDetailsPanel {...(props as HostDetailsExpandableFlyoutProps).params} />
    ),
  },
  {
    key: HostPreviewPanelKeyV2,
    component: (props) => (
      <HostPanel {...(props as HostPanelExpandableFlyoutProps).params} isPreviewMode />
    ),
  },
  {
    key: NetworkPanelKeyV2,
    component: (props) => <NetworkPanel {...(props as NetworkExpandableFlyoutProps).params} />,
  },
  {
    key: NetworkPreviewPanelKeyV2,
    component: (props) => (
      <NetworkPanel {...(props as NetworkExpandableFlyoutProps).params} isPreviewMode />
    ),
  },

  {
    key: ServicePanelKeyV2,
    component: (props) => <ServicePanel {...(props as ServicePanelExpandableFlyoutProps).params} />,
  },
  {
    key: ServiceDetailsPanelKeyV2,
    component: (props) => (
      <ServiceDetailsPanel {...(props as ServiceDetailsExpandableFlyoutProps).params} />
    ),
  },
  {
    key: GenericEntityPanelKeyV2,
    component: (props) => (
      <GenericEntityPanel {...(props as GenericEntityPanelExpandableFlyoutProps).params} />
    ),
  },
  {
    key: GenericEntityDetailsPanelKeyV2,
    component: (props) => (
      <GenericEntityDetailsPanel {...(props as GenericEntityDetailsExpandableFlyoutProps).params} />
    ),
  },
  {
    key: MisconfigurationFindingsPanelKeyV2,
    component: (props) => (
      <FindingsMisconfigurationPanel
        {...(props as FindingsMisconfigurationPanelExpandableFlyoutPropsNonPreview).params}
      />
    ),
  },
  {
    key: EasePanelKeyV2,
    component: (props) => (
      <EaseDetailsProvider {...(props as EaseDetailsProps).params}>
        <EasePanel />
      </EaseDetailsProvider>
    ),
  },
  {
    key: MisconfigurationFindingsPreviewPanelKeyV2,
    component: (props) => (
      <FindingsMisconfigurationPanel
        {...(props as FindingsMisconfigurationPanelExpandableFlyoutPropsPreview).params}
      />
    ),
  },
  {
    key: VulnerabilityFindingsPanelKeyV2,
    component: (props) => (
      <FindingsVulnerabilityPanel
        {...(props as FindingsVulnerabilityPanelExpandableFlyoutPropsNonPreview).params}
      />
    ),
  },
  {
    key: VulnerabilityFindingsPreviewPanelKeyV2,
    component: (props) => (
      <FindingsVulnerabilityPanel
        {...(props as FindingsVulnerabilityPanelExpandableFlyoutPropsPreview).params}
      />
    ),
  },
];

/**
 * Flyout used for the Security Solution application
 * We keep the default EUI 1001 z-index to ensure it is always rendered behind Timeline (which has a z-index of 1002)
 * We propagate the onClose callback to the rest of Security Solution using a window event 'expandable-flyout-on-close-SecuritySolution'
 * This flyout support push/overlay mode. The value is saved in local storage.
 */
export const SecuritySolutionFlyoutV2 = memo(() => {
  return <Flyout registeredPanels={flyoutDocumentsPanels} />;
});

SecuritySolutionFlyoutV2.displayName = 'SecuritySolutionFlyoutV2';
