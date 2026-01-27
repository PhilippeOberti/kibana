/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useEffect, useMemo, useState } from 'react';
import { getFieldValue } from '@kbn/discover-utils';
import type { DocViewerComponent } from '@kbn/unified-doc-viewer/types'; // import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSkeletonText, EuiText } from '@elastic/eui';
// import { ExpandableSection, useExpandSection } from '@kbn/security-flyout';
// import { getUnifiedDocViewerServices } from '@kbn/unified-doc-viewer-plugin/public/plugin';
// import * as i18n from '../translations';
// import { getSecurityTimelineRedirectUrl } from '../utils';
// import { getEcsAllowedValueDescription } from '../utils/ecs_description';
import { EuiSpacer } from '@elastic/eui';
import { useDiscoverServices } from '../../../../hooks/use_discover_services';

// const KEY = 'about';

export const AlertEventOverview: DocViewerComponent = ({ hit }) => {
  const { discoverShared } = useDiscoverServices();
  const discoverFeaturesRegistry = discoverShared.features.registry;
  const testComponent = discoverFeaturesRegistry.getById('security-solution-test');
  const testComponentRender = testComponent?.render;

  const [ResolvedTestComponent, setResolvedTestComponent] = useState<(() => Element) | null>(null);

  const id = useMemo(() => getFieldValue(hit, '_id') as string, [hit]);
  const indexName = useMemo(() => getFieldValue(hit, '_index') as string, [hit]);
  const scopeId = 'test';
  console.group('AlertEventOverview');
  console.log('id', id);
  console.log('indexName', indexName);
  console.log('scopeId', scopeId);
  console.groupEnd();

  useEffect(() => {
    let mounted = true;
    if (!testComponentRender) {
      setResolvedTestComponent(null);
      return;
    }

    testComponentRender({ id, indexName, scopeId })
      .then((Comp) => {
        if (!mounted) return;
        setResolvedTestComponent(() => Comp);
      })
      .catch(() => {
        if (!mounted) return;
        setResolvedTestComponent(null);
      });

    return () => {
      mounted = false;
    };
  }, [id, indexName, testComponentRender]);

  return (
    <>
      {ResolvedTestComponent ? (
        <>
          <EuiSpacer size="m" />
          <ResolvedTestComponent id={id} indexName={indexName} scopeId={scopeId} />
        </>
      ) : null}
    </>
  );

  // console.log('testComponent', testComponent);
  // if (!testComponent) {
  //   return null;
  // }
  //
  // const TestComponent = testComponent.render;
  //
  // return <TestComponent />;

  // const { discoverShared } = getUnifiedDocViewerServices();
  // const testComponent = discoverShared.features.registry.getById('security-solution-test');

  // const {
  //   application: { getUrlForApp },
  //   fieldsMetadata,
  // } = useDiscoverServices();
  //
  // const expanded = useExpandSection({ title: KEY, defaultValue: true });
  //
  // const timelinesURL = getUrlForApp('securitySolutionUI', {
  //   path: 'alerts',
  // });
  //
  // const result = fieldsMetadata?.useFieldsMetadata({
  //   attributes: ['allowed_values', 'name', 'flat_name'],
  //   fieldNames: [fieldConstants.EVENT_CATEGORY_FIELD],
  // });
  //
  // const reason = useMemo(() => getFieldValue(hit, 'kibana.alert.reason') as string, [hit]);
  // const description = useMemo(
  //   () => getFieldValue(hit, 'kibana.alert.rule.description') as string,
  //   [hit]
  // );
  // const alertURL = useMemo(() => getFieldValue(hit, 'kibana.alert.url') as string, [hit]);
  // const eventKind = useMemo(() => getFieldValue(hit, 'event.kind') as string, [hit]);
  // const isAlert = useMemo(() => eventKind === 'signal', [eventKind]);
  // const eventId = useMemo(() => getFieldValue(hit, '_id') as string, [hit]);
  // const eventURL = useMemo(
  //   () =>
  //     getSecurityTimelineRedirectUrl({
  //       from: getFieldValue(hit, '@timestamp') as string,
  //       to: getFieldValue(hit, '@timestamp') as string,
  //       eventId: eventId as string,
  //       index: getFieldValue(hit, '_index') as string,
  //       baseURL: timelinesURL,
  //     }),
  //   [hit, eventId, timelinesURL]
  // );
  //
  // const eventCategory = useMemo(() => getFieldValue(hit, 'event.category') as string, [hit]);
  //
  // return (
  //   <EuiFlexGroup
  //     data-test-subj={isAlert ? 'alertOverview' : 'eventOverview'}
  //     gutterSize="m"
  //     direction="column"
  //     style={{ paddingBlock: '20px' }}
  //   >
  //     <EuiFlexItem>
  //       <ExpandableSection expanded={expanded} title={i18n.aboutSectionTitle}>
  //         {result?.loading ? (
  //           <EuiSkeletonText
  //             lines={2}
  //             size={'s'}
  //             isLoading={result?.loading}
  //             contentAriaLabel={i18n.ecsDescriptionLoadingAriaLable}
  //           />
  //         ) : (
  //           <EuiText size="s" data-test-subj="about">
  //             {getEcsAllowedValueDescription(result?.fieldsMetadata, eventCategory)}
  //           </EuiText>
  //         )}
  //       </ExpandableSection>
  //     </EuiFlexItem>
  //     {description ? (
  //       <EuiFlexItem>
  //         <ExpandableSection expanded={expanded} title={i18n.descriptionSectionTitle}>
  //           <EuiText size="s" data-test-subj="description">
  //             {description}
  //           </EuiText>
  //         </ExpandableSection>
  //       </EuiFlexItem>
  //     ) : null}
  //     {isAlert ? (
  //       <EuiFlexItem>
  //         <ExpandableSection expanded={expanded} title={i18n.reasonSectionTitle}>
  //           <EuiText size="s" data-test-subj="reason">
  //             {reason}
  //           </EuiText>
  //         </ExpandableSection>
  //       </EuiFlexItem>
  //     ) : null}
  //     <EuiFlexItem grow={false}>
  //       <EuiButton
  //         data-test-subj="exploreSecurity"
  //         href={isAlert && alertURL ? alertURL : eventURL}
  //         target="_blank"
  //         iconType="link"
  //         fill
  //         aria-label={i18n.overviewExploreButtonLabel(isAlert)}
  //       >
  //         {i18n.overviewExploreButtonLabel(isAlert)}
  //       </EuiButton>
  //     </EuiFlexItem>
  //   </EuiFlexGroup>
  // );
};
