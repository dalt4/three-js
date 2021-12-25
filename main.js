import './styles.scss'
import * as THREE from 'three'

import {
  EffectComposer,
  EffectPass,
  RenderPass,
  SMAAEffect,
  GodRaysEffect

} from 'postprocessing'

let renderer,
  scene,
  camera

const T = THREE

/**
 * Loads scene assets.
 *
 * @return {Promise} Returns loaded assets when ready.
 */

function load () {
  const assets = new Map()

  const loadingManager = new T.LoadingManager()

  return new Promise((resolve, reject) => {
    loadingManager.onError = reject
    loadingManager.onProgress = (item, loaded, total) => {
      if (loaded === total) {
        resolve(assets)
      }
    }

    loadingManager.onLoad = () => {

    }

    const searchImage = new Image(); const areaImage = new Image()

    searchImage.addEventListener('load', function () {
      assets.set('smaa-search', this)
      loadingManager.itemEnd('smaa-search')
    })

    areaImage.addEventListener('load', function () {
      assets.set('smaa-area', this)
      loadingManager.itemEnd('smaa-area')
    })

    loadingManager.itemStart('smaa-search')
    loadingManager.itemStart('smaa-area')

    searchImage.src = SMAAEffect.searchImageDataURL
    areaImage.src = SMAAEffect.areaImageDataURL
  })
}

function initialize (assets) {
  const container3d = document.querySelector('.container3d')
  const width = container3d.clientWidth
  const height = container3d.clientHeight
  const aspect = width / height

  const clock = new T.Clock()

  renderer = new T.WebGLRenderer({
    powerPreference: 'high-performance',
    antialias: false,
    stencil: false,
    depth: false
  })
  renderer.setSize(width, height)
  renderer.setClearColor(0x000000)
  renderer.physicallyCorrectLights = true
  window.innerWidth <= 1920 ? renderer.setPixelRatio(Math.min(2, window.devicePixelRatio)) : ''
  container3d.appendChild(renderer.domElement)

  scene = new T.Scene()

  camera = new T.PerspectiveCamera(
    45,
    aspect,
    0.1,
    500
  )
  camera.lookAt(scene.position)
  camera.position.z = 25

  // -------------------------------------------------------------------------------lights---------------------------//
  const geometry0 = new THREE.SphereGeometry(2, 32, 16)
  const material0 = new THREE.MeshBasicMaterial({ color: 0xff0000 })
  const bra = new THREE.Mesh(geometry0, material0)
  scene.add(bra)

  const pointLight = new T.PointLight(0xff0000, 150, 0, 2)
  bra.add(pointLight)

  pointLight.position.z = 20

  // ---------------------------------------------------------------------------------meshes-------------------------//

  const geometry = new THREE.PlaneGeometry(50, 50, 50, 50)

  const geometry2 = new THREE.BoxGeometry(0.95, 0.95, 0.01)
  const material2 = new THREE.MeshPhongMaterial({ color: 0x000000 })

  for (let i = 0; i < geometry.attributes.position.count; i++) {
    const p = new THREE.Vector3(
      geometry.attributes.position.getX(i),
      geometry.attributes.position.getY(i),
      geometry.attributes.position.getZ(i)
    )

    const cube = new THREE.Mesh(geometry2, material2)
    cube.position.set(
      p.x,
      p.y,
      10
    )
    scene.add(cube)
  }
  // ---------------------------------------------------------------------------------interactions-------------------//

  const mouse = new T.Vector2()

  document.body.onmousemove = function (e) {
    e.preventDefault()
    mouse.x = (e.clientX / document.documentElement.clientWidth) * 2 - 1
    mouse.y = -((e.clientY - pageYOffset) / document.documentElement.clientHeight) * 2 + 1

    const vector = new T.Vector3(mouse.x, mouse.y, 0.5)
    vector.unproject(camera)
    const dir = vector.sub(camera.position).normalize()
    const distance = -camera.position.z / dir.z
    const pos = camera.position.clone().add(dir.multiplyScalar(distance))
    bra.position.copy(pos)
  }

  // ++++++++++++++++++++++++postprocessing
  const composer = new EffectComposer(
    renderer, {
      frameBufferType: T.HalfFloatType
    }
  )

  const smaaEffect = new SMAAEffect(
    assets.get('smaa-search'),
    assets.get('smaa-area')
  )

  const GodsLight = new GodRaysEffect(camera, bra)

  const renderPass = new RenderPass(scene, camera)
  const smaaPass = new EffectPass(camera, smaaEffect)
  const effectPass = new EffectPass(
    camera,
    GodsLight
  )

  effectPass.renderToScreen = true

  composer.addPass(renderPass)
  composer.addPass(smaaPass)
  composer.addPass(effectPass)

  /**
     * Handles browser resizing.
     *
     * @private
     * @param {Event} event - An event.
     */

  window.addEventListener('resize', (function () {
    let id = 0

    function handleResize () {
      const width = container3d.clientWidth
      const height = container3d.clientHeight

      composer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()

      id = 0
    }

    return function onResize (event) {
      if (id === 0) {
        id = setTimeout(handleResize, 66, event)
      }
    }
  })());

  /**
     * The main render loop.
     *
     * @private
     * @param {DOMHighResTimeStamp} now - An execution timestamp.
     */

  (function render (now) {
    requestAnimationFrame(render)
    composer.render(clock.getDelta())
  })()
}

load().then(initialize).catch(console.error)
