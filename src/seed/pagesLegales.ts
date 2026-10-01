/**
 * Le texte des deux pages légales.
 *
 * Il vit ici, et non dans `seed.ts`, pour être trouvé et relu sans traverser le
 * reste du seed. C'est du contenu, pas du code : une fois le site en ligne, il
 * se modifie dans l'administration (Réglages → Pages légales), et cette version
 * ne sert plus qu'à amorcer une installation neuve.
 *
 * Identité vérifiée sur l'extrait RNE (INPI) du 30/09/2026.
 *
 * ⚠ Deux trous restent à combler, signalés par « [À COMPLÉTER » dans le texte :
 * l'hébergeur (obligatoire, article 6 III de la LCEN) et le médiateur de la
 * consommation (obligatoire pour qui vend à des particuliers, article L.612-1
 * du code de la consommation). Ce texte est une base solide, pas un avis
 * juridique : une relecture par un professionnel reste préférable.
 */
import { contenuRiche, liste, paragraphe, titre2 } from './lexical'

/** Coordonnées de l'entreprise, telles qu'inscrites au RNE. */
export const IDENTITE = {
  denomination: 'TOPCAR 33',
  formeJuridique: 'SAS, société par actions simplifiée',
  capital: '2 000 €',
  siege: '296 avenue Pasteur, 33185 Le Haillan, France',
  siren: '105 378 038',
  siret: '105 378 038 00019',
  tva: 'FR68 105 378 038',
  ape: '4511Z — Commerce de voitures et de véhicules automobiles légers',
  president: 'Kamal GHEZALI',
  directeurGeneral: 'Ali AMRIOU',
  email: 'contact@topcar33.com',
}

export const mentionsLegales = contenuRiche(
  paragraphe(
    'Ces mentions légales s’appliquent au site topcar33.com et à l’ensemble de ses pages. ' +
      'Elles répondent aux obligations d’information de l’article 6 III de la loi du 21 juin 2004 ' +
      'pour la confiance dans l’économie numérique.',
  ),

  titre2('Éditeur du site'),
  liste(
    `Dénomination sociale : ${IDENTITE.denomination}`,
    `Forme juridique : ${IDENTITE.formeJuridique}`,
    `Capital social : ${IDENTITE.capital}`,
    `Siège social : ${IDENTITE.siege}`,
    `SIREN : ${IDENTITE.siren}`,
    `SIRET du siège : ${IDENTITE.siret}`,
    // Le Haillan dépend du greffe de Bordeaux ; à confirmer sur l'extrait Kbis.
    `RCS : Bordeaux ${IDENTITE.siren}`,
    `Numéro de TVA intracommunautaire : ${IDENTITE.tva}`,
    `Code APE : ${IDENTITE.ape}`,
    `Président : ${IDENTITE.president}`,
    `Directeur général : ${IDENTITE.directeurGeneral}`,
    `Email : ${IDENTITE.email}`,
  ),

  titre2('Directeur de la publication'),
  paragraphe(
    `${IDENTITE.president}, en sa qualité de président et représentant légal de ${IDENTITE.denomination}.`,
  ),

  titre2('Hébergeur'),
  paragraphe(
    '[À COMPLÉTER — obligatoire] Nom ou dénomination sociale de l’hébergeur, adresse de son siège ' +
      'et numéro de téléphone. Cette information est exigée par la loi : elle doit être renseignée ' +
      'avant la mise en ligne du site.',
  ),

  titre2('Conception du site'),
  paragraphe(
    'Le site a été conçu et réalisé par Honestinn. [À COMPLÉTER — facultatif] Adresse du site ' +
      'de l’agence, si vous souhaitez y renvoyer.',
  ),

  titre2('Propriété intellectuelle'),
  paragraphe(
    'Le site, sa structure, ses textes, son logo et sa charte graphique sont la propriété de ' +
      `${IDENTITE.denomination} ou font l’objet d’une autorisation d’usage. Toute reproduction ou ` +
      'représentation, totale ou partielle, sans accord écrit préalable, est interdite.',
  ),
  paragraphe(
    'Les marques et logos des constructeurs automobiles cités appartiennent à leurs titulaires ' +
      'respectifs et ne sont mentionnés qu’à titre d’identification des véhicules proposés.',
  ),

  titre2('Informations sur les véhicules'),
  paragraphe(
    'Les photographies des véhicules sont des visuels d’illustration et n’ont pas de valeur ' +
      'contractuelle : l’équipement et la couleur du véhicule effectivement remis peuvent différer.',
  ),
  paragraphe(
    'Les prix et les disponibilités affichés sont donnés à titre indicatif et peuvent évoluer. ' +
      'Seule la proposition écrite que nous vous adressons, ou le contrat signé, engage ' +
      `${IDENTITE.denomination}.`,
  ),

  titre2('Responsabilité'),
  paragraphe(
    'Nous mettons tout en œuvre pour que les informations publiées soient exactes et à jour, sans ' +
      'pouvoir le garantir. Le site peut être momentanément interrompu pour maintenance ou pour une ' +
      'raison indépendante de notre volonté.',
  ),
  paragraphe(
    'Les liens vers des sites extérieurs sont proposés pour votre commodité : leur contenu ne relève ' +
      'pas de notre responsabilité.',
  ),

  titre2('Médiation de la consommation'),
  paragraphe(
    '[À COMPLÉTER — obligatoire pour la vente aux particuliers] Nom, adresse et site du médiateur ' +
      'de la consommation auquel l’entreprise adhère. Tout professionnel vendant à des particuliers ' +
      'doit en désigner un (article L.612-1 du code de la consommation) et le mentionner ici.',
  ),

  titre2('Droit applicable'),
  paragraphe(
    'Le présent site et les relations qu’il engage sont soumis au droit français. En cas de litige, ' +
      'et après une tentative de règlement amiable, les tribunaux français sont compétents.',
  ),

  titre2('Nous écrire'),
  paragraphe(
    `Pour toute question sur ces mentions : ${IDENTITE.email}, ou par courrier à l’adresse du siège ` +
      'social indiquée ci-dessus.',
  ),
)

export const confidentialite = contenuRiche(
  paragraphe(
    'Cette page explique quelles données personnelles nous recueillons sur ce site, pourquoi, ' +
      'combien de temps nous les gardons et comment exercer vos droits. Elle est écrite en ' +
      'application du règlement européen 2016/679 (RGPD).',
  ),

  titre2('Qui est responsable de vos données'),
  paragraphe(
    `${IDENTITE.denomination}, ${IDENTITE.formeJuridique}, dont le siège est situé ${IDENTITE.siege}, ` +
      `immatriculée sous le numéro SIREN ${IDENTITE.siren}. Contact : ${IDENTITE.email}.`,
  ),
  paragraphe(
    'Au vu de notre activité et de notre taille, nous n’avons pas désigné de délégué à la protection ' +
      'des données. Vos demandes sont traitées directement à l’adresse ci-dessus.',
  ),

  titre2('Ce que nous recueillons, et seulement cela'),
  paragraphe('Le formulaire de contact du site nous transmet :'),
  liste(
    'votre prénom et votre nom',
    'votre adresse email',
    'votre numéro de téléphone',
    'votre adresse postale (rue, code postal, ville)',
    'le véhicule concerné, si vous en désignez un',
    'le message que vous écrivez',
  ),
  paragraphe(
    'Tous ces champs sont nécessaires pour vous répondre et préparer un contrat de location ou de ' +
      'vente. Nous ne recueillons aucune autre donnée à votre insu : ce site n’utilise ni outil de ' +
      'mesure d’audience, ni traceur publicitaire, ni bouton de réseau social.',
  ),

  titre2('Pourquoi, et sur quelle base'),
  liste(
    'Répondre à votre demande et préparer le contrat éventuel : exécution de mesures précontractuelles prises à votre demande (article 6.1.b du RGPD).',
    'Conserver une trace de nos échanges et protéger le formulaire des envois automatisés : notre intérêt légitime à faire fonctionner et à sécuriser le site (article 6.1.f).',
  ),

  titre2('Combien de temps nous les gardons'),
  paragraphe(
    'Les demandes sont conservées trois ans à compter de notre dernier échange avec vous, puis ' +
      'supprimées. Les documents liés à un contrat effectivement conclu sont conservés plus longtemps, ' +
      'le temps imposé par les obligations comptables et fiscales.',
  ),

  titre2('Qui y a accès'),
  paragraphe(
    'Vos données sont consultées par les personnes de l’entreprise chargées de traiter votre demande. ' +
      'Elles ne sont ni vendues, ni louées, ni transmises à des tiers à des fins commerciales.',
  ),
  paragraphe('Deux prestataires techniques les hébergent ou les transportent pour notre compte :'),
  liste(
    '[À COMPLÉTER] l’hébergeur du site et de sa base de données',
    '[À COMPLÉTER] le service d’envoi des emails, qui achemine la notification de votre demande',
  ),
  paragraphe(
    'Ces prestataires agissent sur nos instructions et n’utilisent pas vos données pour leur propre ' +
      'compte. Si l’un d’eux devait traiter vos données hors de l’Union européenne, cette page ' +
      'l’indiquerait et préciserait les garanties applicables.',
  ),

  titre2('Anti-spam : votre adresse IP n’est pas conservée'),
  paragraphe(
    'Pour empêcher l’envoi massif de formulaires, nous limitons le nombre de demandes par heure. ' +
      'Cette limite repose sur une empreinte calculée à partir de votre adresse IP par une fonction ' +
      'à sens unique : l’adresse elle-même n’est jamais enregistrée, et l’empreinte ne permet pas ' +
      'de la retrouver.',
  ),

  titre2('Cookies'),
  paragraphe(
    'Ce site ne dépose qu’un seul cookie auprès des visiteurs : il retient votre choix de thème ' +
      'clair ou sombre, pendant un an. Il est strictement nécessaire au fonctionnement que vous avez ' +
      'demandé et ne sert à aucun suivi, ce qui le dispense de consentement.',
  ),
  paragraphe(
    'D’autres cookies, de session, sont utilisés dans l’espace d’administration réservé à l’équipe. ' +
      'Ils ne concernent pas les visiteurs du site.',
  ),

  titre2('Vos droits'),
  paragraphe('Vous disposez à tout moment du droit :'),
  liste(
    'd’accéder aux données que nous détenons sur vous',
    'de les faire rectifier si elles sont inexactes',
    'd’en demander l’effacement',
    'd’en demander la limitation du traitement',
    'de vous opposer à leur traitement',
    'de les recevoir dans un format réutilisable (portabilité)',
  ),
  paragraphe(
    `Pour exercer l’un de ces droits, écrivez à ${IDENTITE.email} ou à l’adresse du siège social. ` +
      'Nous vous répondons dans un délai d’un mois. Une preuve d’identité peut vous être demandée ' +
      'en cas de doute raisonnable sur l’origine de la demande.',
  ),
  paragraphe(
    'Si notre réponse ne vous satisfait pas, vous pouvez saisir la Commission nationale de ' +
      'l’informatique et des libertés (CNIL), 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, ' +
      'ou déposer une réclamation sur cnil.fr.',
  ),

  titre2('Sécurité'),
  paragraphe(
    'Les échanges avec le site sont chiffrés. L’accès à l’administration est réservé aux comptes ' +
      'autorisés et protégé par un code à usage unique envoyé par email.',
  ),

  titre2('Modifications'),
  paragraphe(
    'Cette page peut être mise à jour pour suivre l’évolution du site ou de la réglementation. ' +
      'La version affichée ici est toujours celle en vigueur.',
  ),
)
