/* A continuous, high-resolution sculpture in a reflected-light studio.
   One WebGL context; no animation work while offscreen or motion is paused. */
(async () => {
  'use strict';
  const mount = document.getElementById('scene3d');
  const status = document.getElementById('renderStatus');
  const motionButton = document.getElementById('motionToggle');
  const qualityButton = document.getElementById('qualityToggle');
  const rotateButton = document.getElementById('rotateScene');
  const materialButtons = [...document.querySelectorAll('[data-material]')];
  const controls = [motionButton, qualityButton, rotateButton, ...materialButtons];
  let sceneSettled = false;
  function signalSceneSettled() {
    if (sceneSettled) return;
    sceneSettled = true;
    window.dispatchEvent(new Event('portfolio:scene-settled'));
  }
  function fallback() {
    signalSceneSettled();
    mount.classList.remove('render-ready');
    status.textContent = 'Still edition';
    controls.forEach(button => { button.disabled = true; });
  }
  let T, Reflector;
  try { T = await import('./assets/three.module.min.js'); ({ Reflector } = await import('./assets/Reflector.js')); }
  catch (_) { fallback(); return; }
  let renderer;
  try {
    renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (_) { fallback(); return; }

  try {
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);
    const scene = new T.Scene();
    scene.background = new T.Color(0x0b0c0e);
    const camera = new T.PerspectiveCamera(36, 1, .1, 60);
    const cameraTarget = new T.Vector3(0, -.12, 0);
    camera.position.set(0, .5, 10.3);
    camera.lookAt(cameraTarget);

    // HDR light panels become the reflections, rather than flat ambient light.
    const studio = new T.Scene();
    const room = new T.Mesh(new T.BoxGeometry(30, 25, 30), new T.MeshBasicMaterial({ color: 0x171820, side: T.BackSide }));
    studio.add(room);
    function panel(width, height, position, rotation, tint, intensity) {
      const material = new T.ShaderMaterial({
        side: T.DoubleSide,
        uniforms: { color: { value: new T.Color(tint).multiplyScalar(intensity) } },
        vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader: 'varying vec2 vUv;uniform vec3 color;void main(){vec2 edge=smoothstep(vec2(0.),vec2(.12),vUv)*smoothstep(vec2(0.),vec2(.12),1.-vUv);gl_FragColor=vec4(color*edge.x*edge.y,1.);}'
      });
      const light = new T.Mesh(new T.PlaneGeometry(width, height), material);
      light.position.set(...position); light.rotation.set(...rotation); studio.add(light);
    }
    panel(4, 10, [-5, 2, 4], [0, Math.PI / 3, 0], 0xf3f6ff, 6);
    panel(2, 11, [5, 1, 2], [0, -Math.PI / 3, 0], 0xe2e4f0, 7);
    panel(10, 4, [0, 7, 0], [Math.PI / 2, 0, 0], 0xffffff, 5);
    panel(5, 7, [-4, 0, -5], [0, .6, 0], 0x978abe, 3);
    panel(1.2, 8, [4, -1, -4], [0, -.6, 0], 0xd2e9a1, 3);
    panel(8, 3, [0, -6, 1], [Math.PI / 2, 0, 0], 0x999ead, 1);
    const pmrem = new T.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(studio, .04);
    scene.environment = environment.texture;
    pmrem.dispose();
    studio.traverse(object => { if (object.isMesh) { object.geometry.dispose(); object.material.dispose(); } });

    const chrome = new T.MeshPhysicalMaterial({
      color: 0xaeb6c3, metalness: 1, roughness: .19, clearcoat: 1,
      clearcoatRoughness: .13, envMapIntensity: 1.3
    });
    const glass = new T.MeshPhysicalMaterial({
      color: 0xf7f7ff, metalness: 0, roughness: .025, transmission: .98,
      thickness: 2.4, ior: 1.45, dispersion: .12, clearcoat: 1, clearcoatRoughness: .035,
      envMapIntensity: 1.8, attenuationColor: new T.Color(0xbcc2e4), attenuationDistance: 4.5
    });
    const darkGlass = new T.MeshPhysicalMaterial({
      color: 0x686c94, metalness: .1, roughness: .12, transmission: .88,
      thickness: .7, ior: 1.45, clearcoat: 1, envMapIntensity: 1.2
    });

    // Elliptical cross-sections gently twist along a closed, trefoil-like path.
    // The surface is continuous: 720 longitudinal segments and 64 radial segments.
    class SculptureCurve extends T.Curve {
      getPoint(t, target = new T.Vector3()) {
        const a = t * Math.PI * 2;
        const radius = 1.33 + .44 * Math.cos(3 * a);
        return target.set(radius * Math.cos(2 * a), radius * Math.sin(2 * a), .61 * Math.sin(3 * a));
      }
    }
    const curve = new SculptureCurve();
    const segments = 720, radial = 64;
    const frames = curve.computeFrenetFrames(segments, true);
    const positions = [], uvs = [], indices = [];
    const p = new T.Vector3(), normal = new T.Vector3(), binormal = new T.Vector3();
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      curve.getPoint(t, p);
      const twist = t * Math.PI * 4;
      normal.copy(frames.normals[i]).multiplyScalar(Math.cos(twist)).addScaledVector(frames.binormals[i], Math.sin(twist));
      binormal.copy(frames.binormals[i]).multiplyScalar(Math.cos(twist)).addScaledVector(frames.normals[i], -Math.sin(twist));
      const width = .42 + .10 * Math.sin(t * Math.PI * 6 + .5);
      for (let j = 0; j <= radial; j++) {
        const a = j / radial * Math.PI * 2;
        const x = Math.cos(a) * width, y = Math.sin(a) * .28;
        positions.push(p.x + normal.x*x + binormal.x*y, p.y + normal.y*x + binormal.y*y, p.z + normal.z*x + binormal.z*y);
        uvs.push(t, j / radial);
        if (i < segments && j < radial) {
          const k = i * (radial + 1) + j;
          indices.push(k, k+1, k+radial+1, k+1, k+radial+2, k+radial+1);
        }
      }
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    // Average the parameter seams so light flows continuously across the surface.
    const normals = geometry.attributes.normal;
    function average(a,b) { normal.fromBufferAttribute(normals,a);binormal.fromBufferAttribute(normals,b);normal.add(binormal).normalize();normals.setXYZ(a,normal.x,normal.y,normal.z);normals.setXYZ(b,normal.x,normal.y,normal.z); }
    for(let i=0;i<=segments;i++) average(i*(radial+1),i*(radial+1)+radial);
    for(let j=0;j<=radial;j++) average(j,segments*(radial+1)+j);
    normals.needsUpdate=true;
    const assembly = new T.Group(); scene.add(assembly);
    const sculpture = new T.Mesh(geometry, chrome);
    sculpture.castShadow = true; sculpture.receiveShadow = true;
    sculpture.rotation.set(.1, -.25, -.45);
    assembly.add(sculpture);

    // A separate optical-glass ribbon creates depth through contrasting materials.
    const glassRibbon = new T.Mesh(new T.TorusGeometry(1.65, .095, 32, 256), darkGlass);
    glassRibbon.scale.set(1, 1.32, 1); glassRibbon.rotation.set(.55, .62, -.8);
    glassRibbon.position.set(.18, .02, -.3); glassRibbon.castShadow = true;
    assembly.add(glassRibbon);
    assembly.position.set(.3, .15, 0);

    scene.add(new T.HemisphereLight(0xd3dafa, 0x19191f, .7));
    const key = new T.DirectionalLight(0xe3e9ff, 3.2);
    key.position.set(-4, 7, 6); key.castShadow = true;
    key.shadow.mapSize.set(2048,2048); key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;
    key.shadow.camera.near=.1;key.shadow.camera.far=25;key.shadow.bias=-.00015;key.shadow.normalBias=.02;key.shadow.radius=4;scene.add(key);
    const rim = new T.DirectionalLight(0xc1b4e9, 1.5); rim.position.set(4,2,-4); scene.add(rim);
    const soft = new T.DirectionalLight(0xeeffd0, .9); soft.position.set(-2,-1,3); scene.add(soft);

    let floor = null;
    if (Reflector) {
      floor = new Reflector(new T.PlaneGeometry(30,30), { color:0x535461, textureWidth:1024, textureHeight:1024, clipBias:.003 });
      floor.rotation.x=-Math.PI/2;floor.position.y=-2.65;
      // Blur and fade the reflected image into the dark studio, with no hard horizon.
      floor.material.transparent=true;
      floor.material.depthWrite=false;
            floor.material.vertexShader = floor.material.vertexShader.replace('varying vec4 vUv;', 'varying vec4 vUv; varying vec3 vLocal;').replace('void main() {', 'void main() { vLocal = position;');
      floor.material.fragmentShader = floor.material.fragmentShader.replace('varying vec4 vUv;', 'varying vec4 vUv; varying vec3 vLocal;').replace('vec4 base = texture2DProj( tDiffuse, vUv );', 'vec2 uv = vUv.xy / vUv.w; vec4 base = texture2D(tDiffuse, uv) * .4; base += texture2D(tDiffuse, uv + vec2(.003,0.)) * .15; base += texture2D(tDiffuse, uv - vec2(.003,0.)) * .15; base += texture2D(tDiffuse, uv + vec2(0.,.003)) * .15; base += texture2D(tDiffuse, uv - vec2(0.,.003)) * .15;').replace('gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );','float fade=1.-smoothstep(2.,7.,length(vLocal.xy)); gl_FragColor = vec4(blendOverlay(base.rgb,color), .22*fade);');
      scene.add(floor);
    }
    const shadowPlane=new T.Mesh(new T.PlaneGeometry(25,25),new T.ShadowMaterial({opacity:.25}));
    shadowPlane.rotation.x=-Math.PI/2;shadowPlane.position.y=-2.64;shadowPlane.receiveShadow=true;scene.add(shadowPlane);

    const media=matchMedia('(prefers-reduced-motion: reduce)');
    let paused=media.matches;
    let high=innerWidth>680;
    let inView=true,visible=!document.hidden,disposed=false;
    let raf=0,last=0,time=0,idleYaw=0,manualUntil=0,dirty=true;
    const IDLE_SPIN_SPEED = Math.PI * 2 / 60; // One relaxed revolution per minute.
    let targetYaw=0,yaw=0,targetPitch=0,pitch=0,pointerX=0,pointerY=0;
    let drag=null;
    function updateControls() {
      motionButton.textContent=paused?'▷':'Ⅱ';
      motionButton.setAttribute('aria-label',paused?'Resume motion':'Pause motion');
      motionButton.setAttribute('aria-pressed',String(paused));
      qualityButton.textContent=high?'High detail':'Light detail';
      qualityButton.setAttribute('aria-pressed',String(high));
      status.textContent=paused?'A moment of stillness':'Drag to explore';
    }
    function resize() {
      const width=mount.clientWidth,height=mount.clientHeight;
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,high?2:1.25));
      renderer.setSize(width,height,false);
      camera.aspect=width/height;
      camera.position.z=innerWidth<=680?9.9:10.3;
      camera.updateProjectionMatrix();
      if(floor)floor.visible=high;
      renderer.shadowMap.enabled=high;
      dirty=true;wake();
    }
    function frame(now) {
      raf=0;
      if(disposed||!visible||!inView)return;
      const delta=last?Math.min((now-last)/1000,.05):0;last=now;
      const settling=Math.abs(yaw-targetYaw)>.0003||Math.abs(pitch-targetPitch)>.0003;
      if(paused&&!dirty&&!settling)return;
      if(!paused && !drag && now >= manualUntil) { time += delta; idleYaw += delta * IDLE_SPIN_SPEED; }
      const ease=paused||drag?1:1-Math.exp(-delta*7);
      yaw+=(targetYaw-yaw)*ease;pitch+=(targetPitch-pitch)*ease;
      assembly.rotation.set(pitch+Math.sin(time*.22)*.035,yaw+idleYaw,-.09);
      assembly.position.y=.15+Math.sin(time*.35)*.06;
      if (!paused && !drag) {
        camera.position.x+=(pointerX*.18-camera.position.x)*.045;
        camera.position.y+=(.5+pointerY*.12-camera.position.y)*.045;
      }
      camera.lookAt(cameraTarget);
      renderer.render(scene,camera);
      mount.classList.add('render-ready');signalSceneSettled();dirty=false;
      if(!paused||settling)raf=requestAnimationFrame(frame);
    }
    function wake(){if(!raf&&visible&&inView&&!disposed)raf=requestAnimationFrame(frame);}
    mount.addEventListener('pointerdown',event=>{if(event.button!==0)return;drag={x:event.clientX,y:event.clientY,id:event.pointerId};mount.setPointerCapture(event.pointerId);});
    mount.addEventListener('pointermove',event=>{
      if(drag){targetYaw+=(event.clientX-drag.x)*.006;targetPitch=Math.max(-.4,Math.min(.4,targetPitch+(event.clientY-drag.y)*.003));drag.x=event.clientX;drag.y=event.clientY;dirty=true;wake();}
      else if(!paused&&event.pointerType==='mouse'){const rect=mount.getBoundingClientRect();pointerX=(event.clientX-rect.left)/rect.width-.5;pointerY=(event.clientY-rect.top)/rect.height-.5;}
    });
    function release(){if(drag) manualUntil=performance.now()+450;drag=null;}
    mount.addEventListener('pointerup',release);mount.addEventListener('pointercancel',release);mount.addEventListener('lostpointercapture',release);
    mount.addEventListener('pointerleave',()=>{pointerX=pointerY=0;});
    rotateButton.addEventListener('click',()=>{targetYaw+=Math.PI/5;manualUntil=performance.now()+700;dirty=true;wake();});
    motionButton.addEventListener('click',()=>{paused=!paused;pointerX=pointerY=0;updateControls();dirty=true;wake();});
    qualityButton.addEventListener('click',()=>{high=!high;updateControls();resize();});
    materialButtons.forEach(button=>button.addEventListener('click',()=>{
      const selected=button.dataset.material;
      sculpture.material=selected==='glass'?glass:chrome;
      glassRibbon.material=selected==='glass'?chrome:darkGlass;
      materialButtons.forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});
      dirty=true;wake();
    }));
    media.addEventListener('change',()=>{paused=media.matches;updateControls();dirty=true;wake();});
    const intersection=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;last=0;if(inView){dirty=true;wake();}else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'60px'});
    intersection.observe(mount);
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(mount);
    document.addEventListener('visibilitychange',()=>{visible=!document.hidden;last=0;if(visible){dirty=true;wake();}else{cancelAnimationFrame(raf);raf=0;}});
    renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();disposed=true;cancelAnimationFrame(raf);renderer.domElement.style.display='none';fallback();});
    renderer.domElement.addEventListener('webglcontextrestored',()=>location.reload());
    updateControls();resize();
  } catch(error) {
    console.warn('The interactive sculpture is unavailable.',error);
    renderer.dispose();renderer.domElement.remove();fallback();
  }
})();
