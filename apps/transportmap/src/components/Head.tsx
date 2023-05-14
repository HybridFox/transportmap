import { FC } from "react";
import { useTranslation } from "react-i18next";
import {Helmet} from "react-helmet";

export const Head: FC = () => {
	const [t, i18n] = useTranslation();

	return (<Helmet>
		<meta http-equiv="content-language" content={i18n.language} />
		<meta name="description" content={t('SEO.META.DESCRIPTION')!} />
	</Helmet>)
}
