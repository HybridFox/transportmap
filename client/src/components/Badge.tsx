import styled from 'styled-components';

export const Badge = styled.div<{
	borderColor?: string;
	color?: string;
	backgroundColor?: string;
}>`
	display: inline-block;
	min-width: 2.75em;
	text-align: center;
	padding: 0 0.25rem;
	font-weight: bold;
	color: ${(props) => props.color};
	border-radius: 10px;
	border: 3px solid ${(props) => props.borderColor};
	margin-left: 0rem;
	margin-right: 0.75rem;
	font-size: 0.75rem;
	line-height: 1.6em;
	background-color: ${(props) => props.backgroundColor};
`;
