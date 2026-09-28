/* eslint-disable @next/next/no-img-element */

/**
 * Logo de la charte sur l'écran de connexion de l'administration.
 * Les deux versions sont rendues ; custom.scss affiche celle qui va avec le thème.
 */
export function LogoAdmin() {
  const style = { width: '100%', maxWidth: 320, height: 'auto' }

  return (
    <>
      <img className="tc-logo tc-logo--clair" src="/marque/logo-horizontal-couleur.svg" alt="TopCar33" style={style} />
      <img className="tc-logo tc-logo--sombre" src="/marque/logo-horizontal-blanc.svg" alt="TopCar33" style={style} />
    </>
  )
}
