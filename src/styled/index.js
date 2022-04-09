import styled, { css } from 'styled-components';

export const MyIcon = styled.div`
    border: 2px solid black;

`;

export const VocalSpan = styled.span`
    display: inline;
    ${props => props.voice && css`
        font-family: ${props.voice.font};
        letter-spacing: ${props.voice.spacing}px;
        font-weight: ${props.voice.weight};
        font-size: calc(${props.voice.size}rem + 0.3vw);
    `}
`;

export const OverlayContentContainer = styled.div`
    position: relative;
    width: calc(500px + 40vw);
    max-width: 95vw;
    min-height: 70vh;
    justify-content: center;
    align-items: center;
    background-color: white;
    flex-direction: column;
`;