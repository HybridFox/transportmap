import { FC } from "react";
import { useTranslation } from "react-i18next";
import {Helmet} from "react-helmet";
import { useNavigation } from "react-router-dom";

export const Head: FC = () => {
	const [t, i18n] = useTranslation();
	const route = useNavigation();

	return (<Helmet>
		<meta http-equiv="content-language" content={i18n.language} />
		<meta name="description" content={t('SEO.META.DESCRIPTION')!} />
		<link rel="canonical" href={`https://waarismijntrein.be${window.location.pathname}`} />
	</Helmet>)
}
