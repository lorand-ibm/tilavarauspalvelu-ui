import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { useReactOidc } from "@axa-fr/react-oidc-context";
import ApplicationRound from "./component/recurring-reservations/ApplicationRound";
import PageWrapper from "./component/PageWrapper";
import "./i18n";
import Application from "./component/applications/Application";
import ApplicationDetails from "./component/applications/ApplicationDetails";
import Recommendation from "./component/recurring-reservations/Recommendation";
import RecommendationsByApplicant from "./component/recurring-reservations/RecommendationsByApplicant";
import ApplicationRounds from "./component/recurring-reservations/ApplicationRounds";
import AllApplicationRounds from "./component/recurring-reservations/AllApplicationRounds";
import MainLander from "./component/MainLander";
import Approval from "./component/decisions/Approval";
import Applications from "./component/applications/Applications";
import Criteria from "./component/recurring-reservations/Criteria";
import RecommendationsByReservationUnit from "./component/recurring-reservations/RecommendationsByReservationUnit";
import ApplicationRoundApprovals from "./component/decisions/ApplicationRoundApprovals";
import { publicUrl } from "./common/const";
import ResolutionReport from "./component/recurring-reservations/ResolutionReport";
import ReservationsByReservationUnit from "./component/recurring-reservations/ReservationsByReservationUnit";
import ReservationSummariesByReservationUnit from "./component/recurring-reservations/ReservationSummariesByReservationUnit";
import ReservationByApplicationEvent from "./component/applications/ReservationByApplicationEvent";
import SpacesList from "./component/Spaces/SpacesList";
import Units from "./component/Unit/Units";
import Unit from "./component/Unit/Unit";
import UnitMap from "./component/Unit/UnitMap";
import SpacesResources from "./component/Unit/SpacesResources";
import SpaceEditorView from "./component/Spaces/space-editor/SpaceEditorView";
import ResourceEditorView from "./component/Resources/resource-editor/ResourceEditorView";
import ReservationUnitEditor from "./component/ReservationUnits/ReservationUnitEditor/ReservationUnitEditor";
import ResourcesList from "./component/Resources/ResourcesList";
import ReservationUnitsList from "./component/ReservationUnits/ReservationUnitsList";
import ReservationUnitsSearch from "./component/ReservationUnits/ReservationUnitsSearch";
import { withGlobalContext } from "./context/GlobalContexts";

import RequestedReservations from "./component/reservations/requested/RequestedReservations";
import RequestedReservation from "./component/reservations/requested/RequestedReservation";
import PrivateRoutes from "./common/PrivateRoutes";
import { prefixes } from "./common/urls";
import Error403 from "./common/Error403";

function App(): JSX.Element {
  const { oidcUser } = useReactOidc();

  return (
    <BrowserRouter basename={publicUrl}>
      <PageWrapper>
        <Switch>
          <Route
            exact
            path="/"
            component={oidcUser ? ApplicationRounds : MainLander}
          />
          <Route exact path="/403" component={Error403} />
          <PrivateRoutes>
            <Route
              exact
              path={`${prefixes.applications}/:applicationId`}
              component={Application}
            />
            <Route
              exact
              path={`${prefixes.applications}/:applicationId/details`}
              component={ApplicationDetails}
            />
            <Route
              exact
              path={`${prefixes.applications}/:applicationId/recurringReservation/:recurringReservationId`}
              component={ReservationByApplicationEvent}
            />
            <Route
              exact
              path={`${prefixes.recurringReservations}/application-rounds`}
              component={AllApplicationRounds}
            />
            <Route
              exact
              path={`${prefixes.recurringReservations}/decisions`}
              component={ApplicationRoundApprovals}
            />
            <Route
              path={`${prefixes.recurringReservations}/decisions/:applicationRoundId/approval`}
              component={Approval}
              exact
            />

            <Route
              path={`${prefixes.recurringReservations}/application-rounds/:applicationRoundId/applications`}
              component={Applications}
              exact
            />
            <Route
              path={`${prefixes.recurringReservations}/application-rounds/:applicationRoundId/resolution`}
              component={ResolutionReport}
              exact
            />
            <Route
              path={`${prefixes.recurringReservations}/application-rounds/:applicationRoundId/criteria`}
              component={Criteria}
              exact
            />
            <Route
              path={`${prefixes.recurringReservations}/application-rounds/:applicationRoundId/reservationUnit/:reservationUnitId/reservations/summary`}
              component={ReservationSummariesByReservationUnit}
              exact
            />
            <Route
              path={`${prefixes.recurringReservations}/application-rounds/:applicationRoundId/reservationUnit/:reservationUnitId/reservations`}
              component={ReservationsByReservationUnit}
              exact
            />
            <Route
              path={`${prefixes.recurringReservations}/application-rounds/:applicationRoundId/reservationUnit/:reservationUnitId`}
              component={RecommendationsByReservationUnit}
              exact
            />
            <Route
              path={`${prefixes.recurringReservations}/application-rounds/:applicationRoundId/applicant/:applicantId`}
              component={RecommendationsByApplicant}
              exact
            />
            <Route
              path={`${prefixes.recurringReservations}/application-rounds/:applicationRoundId/organisation/:organisationId`}
              component={RecommendationsByApplicant}
              exact
            />
            <Route
              path={`${prefixes.recurringReservations}/application-rounds/:applicationRoundId/recommendation/:applicationEventScheduleId`}
              component={Recommendation}
              exact
            />
            <Route
              path={`${prefixes.recurringReservations}/application-rounds/:applicationRoundId`}
              component={ApplicationRound}
              exact
            />
            <Route path="/spaces" component={SpacesList} />
            <Route
              path="/reservationUnits"
              component={ReservationUnitsList}
              exact
            />
            <Route
              path="/reservationUnits/search"
              component={ReservationUnitsSearch}
            />
            <Route path="/resources" component={ResourcesList} />
            <Route path="/units" component={Units} />
            <Route path="/unit/:unitPk/map" component={UnitMap} />
            <Route
              path="/unit/:unitPk/spacesResources"
              component={SpacesResources}
              exact
            />
            <Route
              path="/unit/:unitPk/space/edit/:spacePk"
              component={SpaceEditorView}
            />
            <Route
              path="/unit/:unitPk/resource/edit/:resourcePk"
              component={ResourceEditorView}
            />
            <Route
              path="/unit/:unitPk/reservationUnit/edit/:reservationUnitPk?"
              component={ReservationUnitEditor}
            />
            <Route path="/unit/:unitPk" component={Unit} exact />
            <Route
              path="/reservations/requested/:reservationPk"
              component={RequestedReservation}
              exact
            />
            <Route
              path="/reservations/requested"
              exact
              component={RequestedReservations}
            />
          </PrivateRoutes>
        </Switch>
      </PageWrapper>
    </BrowserRouter>
  );
}

export default withGlobalContext(App);
