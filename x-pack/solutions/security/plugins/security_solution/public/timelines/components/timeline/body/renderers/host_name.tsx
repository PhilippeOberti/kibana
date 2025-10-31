/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useContext, useMemo } from 'react';
import type { EuiButtonEmpty, EuiButtonIcon } from '@elastic/eui';
import { isString } from 'lodash/fp';
import { useExpandableFlyoutApi } from '@kbn/expandable-flyout';
import { useFlyoutApi } from '@kbn/flyout';
import { HostPanelKeyV2 } from '../../../../../flyoutV2/entity_details/shared/constants';
import { HostPanelKey } from '../../../../../flyout/entity_details/shared/constants';
import { StatefulEventContext } from '../../../../../common/components/events_viewer/stateful_event_context';
import { HostDetailsLink } from '../../../../../common/components/links';
import { getEmptyTagValue } from '../../../../../common/components/empty_value';
import { TruncatableText } from '../../../../../common/components/truncatable_text';
import { useIsInSecurityApp } from '../../../../../common/hooks/is_in_security_app';
import { useIsExperimentalFeatureEnabled } from '../../../../../common/hooks/use_experimental_features';

interface Props {
  contextId: string;
  Component?: typeof EuiButtonEmpty | typeof EuiButtonIcon;
  isButton?: boolean;
  onClick?: () => void;
  value: string | number | undefined | null;
  title?: string;
}

const HostNameComponent: React.FC<Props> = ({
  Component,
  contextId,
  isButton,
  onClick,
  title,
  value,
}) => {
  const { openFlyout } = useExpandableFlyoutApi();
  const { openFlyout: openFlyoutV2 } = useFlyoutApi();
  const newFlyoutEnabled = useIsExperimentalFeatureEnabled('newFlyout');

  const isInSecurityApp = useIsInSecurityApp();

  const eventContext = useContext(StatefulEventContext);
  const hostName = `${value}`;
  const isInTimelineContext =
    hostName && eventContext?.enableHostDetailsFlyout && eventContext?.timelineID;

  const openHostDetailsSidePanel = useCallback(
    (e: React.SyntheticEvent<Element, Event>) => {
      e.preventDefault();

      if (onClick) {
        onClick();
      }

      /*
       * if and only if renderer is running inside security solution app
       * we check for event and timeline context
       * */
      if (!eventContext || !isInTimelineContext) {
        return;
      }

      const { timelineID } = eventContext;
      if (newFlyoutEnabled) {
        openFlyoutV2({
          main: {
            id: HostPanelKeyV2,
            params: {
              hostName,
              contextID: contextId,
              scopeId: timelineID,
            },
          },
        });
      } else {
        openFlyout({
          right: {
            id: HostPanelKey,
            params: {
              hostName,
              contextID: contextId,
              scopeId: timelineID,
            },
          },
        });
      }
    },
    [
      contextId,
      eventContext,
      hostName,
      isInTimelineContext,
      newFlyoutEnabled,
      onClick,
      openFlyout,
      openFlyoutV2,
    ]
  );

  // The below is explicitly defined this way as the onClick takes precedence when it and the href are both defined
  // When this component is used outside of timeline/alerts table (i.e. in the flyout) we would still like it to link to the Host Details page
  const content = useMemo(
    () => (
      <HostDetailsLink
        Component={Component}
        hostName={hostName}
        isButton={isButton}
        onClick={isInTimelineContext || !isInSecurityApp ? openHostDetailsSidePanel : undefined}
        title={title}
      >
        <TruncatableText data-test-subj="draggable-truncatable-content">{hostName}</TruncatableText>
      </HostDetailsLink>
    ),
    [
      Component,
      hostName,
      isButton,
      isInTimelineContext,
      openHostDetailsSidePanel,
      title,
      isInSecurityApp,
    ]
  );

  return isString(value) && hostName.length > 0 ? content : getEmptyTagValue();
};

export const HostName = React.memo(HostNameComponent);
HostName.displayName = 'HostName';
