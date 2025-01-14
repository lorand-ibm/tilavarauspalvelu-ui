import { IconLocation } from "hds-react";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { UnitByPkType } from "../../common/gql-types";
import { parseAddress } from "../../common/util";
import { ContentContainer, IngressContainer } from "../../styles/layout";
import { H1 } from "../../styles/typography";
import LinkPrev from "../LinkPrev";

interface IProps {
  title: string;
  unit: UnitByPkType;
  link?: string;
}

const Wrapper = styled.div`
  margin-bottom: var(--spacing-m);
`;
const Name = styled.div`
  font-size: var(--fontsize-heading-m);
  font-family: var(--tilavaraus-admin-font-bold);
  margin-bottom: var(--spacing-xs);
`;

const Container = styled.div`
  display: flex;
`;

const Address = styled.span`
  line-height: 26px;
`;

const LocationIcon = styled(IconLocation)`
  margin: 2px var(--spacing-s) 2px 0;
`;

const Label = styled(Address)`
  font-family: var(--tilavaraus-admin-font-bold);
`;

const SubPageHead = ({ title, unit, link }: IProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <ContentContainer>
        <LinkPrev route={link || `/unit/${unit.pk}`} />
      </ContentContainer>
      <IngressContainer>
        <H1>{title}</H1>
        <Container>
          <LocationIcon />
          <div>
            <Name>{unit.nameFi}</Name>
            <Label>{t("Unit.address")}</Label>:{" "}
            {unit.location ? (
              <Address>{parseAddress(unit.location)}</Address>
            ) : null}
          </div>
        </Container>
      </IngressContainer>
    </Wrapper>
  );
};

export default SubPageHead;
