document.addEventListener('DOMContentLoaded', () => {
    const els = {
        health: document.getElementById('health-bar'),
        fuel: document.getElementById('fuel-bar'),
        healthPercent: document.getElementById('health-percent'),
        fuelPercent: document.getElementById('fuel-percent'),
        speed: document.getElementById('speed-display'),
        gear: document.getElementById('gear-display'),
        unit: document.getElementById('speed-unit'),
        rpm: document.getElementById('rpm-boxes'),
        icons: {
            engine: document.getElementById('icon-engine'),
            lights: document.getElementById('icon-lights'),
            left: document.getElementById('icon-left'),
            right: document.getElementById('icon-right'),
            seatbelt: document.getElementById('icon-seatbelt')
        },
        audio: {
            tick: document.getElementById('audio-tick'),
            alarm: document.getElementById('audio-alarm')
        }
    };

    // Make health label draggable
    const healthLabel = document.getElementById('health-label');
    if (healthLabel) {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        healthLabel.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = healthLabel.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            healthLabel.style.position = 'fixed';
            healthLabel.style.zIndex = '1000';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            healthLabel.style.left = (initialX + deltaX) + 'px';
            healthLabel.style.top = (initialY + deltaY) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    // Make fuel label draggable
    const fuelLabel = document.getElementById('fuel-label');
    if (fuelLabel) {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        fuelLabel.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = fuelLabel.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            fuelLabel.style.position = 'fixed';
            fuelLabel.style.zIndex = '1000';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            fuelLabel.style.left = (initialX + deltaX) + 'px';
            fuelLabel.style.top = (initialY + deltaY) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    // Make engine icon draggable
    const engineIcon = document.getElementById('icon-engine');
    if (engineIcon) {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        engineIcon.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = engineIcon.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            engineIcon.style.position = 'fixed';
            engineIcon.style.zIndex = '1000';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            engineIcon.style.left = (initialX + deltaX) + 'px';
            engineIcon.style.top = (initialY + deltaY) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    const vehicleState = {
        engineOn: false,
        hasMoved: false,
        isMotorcycle: true,
        engineHealth: 1.0
    };

    const manageLoopingAudio = (audioEl, shouldPlay) => {
        // Audio disabled - function does nothing
        return;
    };

    const toggleIcon = (id, state) => {
        if (els.icons[id]) {
            els.icons[id].classList.toggle('active', !!state);
        }
    };

    const updateEngineIcon = () => {
        const engineIcon = els.icons.engine;
        if (!engineIcon) return;

        // Remove all engine-specific classes
        engineIcon.classList.remove('engine-warning', 'engine-critical');

        if (!vehicleState.engineOn) {
            // Engine off: 10% opacity, greyed out
            engineIcon.classList.remove('active');
            return;
        }

        // Engine on: 50% opacity
        engineIcon.classList.add('active');

        // Check health levels for blinking
        const healthPercentage = vehicleState.engineHealth * 100;
        
        if (healthPercentage <= 40) {
            // Critical health: blink red
            engineIcon.classList.add('engine-critical');
        } else if (healthPercentage <= 70) {
            // Warning health: blink yellow
            engineIcon.classList.add('engine-warning');
        }
        // Above 70%: normal state (no blinking)
    };

    // Function to change speedometer background color and opacity
    window.setSpeedoBackground = (r, g, b, opacity = null) => {
        const root = document.documentElement;
        root.style.setProperty('--speedo-bg-color', `${r}, ${g}, ${b}`);
        if (opacity !== null) {
            root.style.setProperty('--speedo-bg-opacity', opacity);
        }
    };

    // Function to change only opacity
    window.setSpeedoOpacity = (opacity) => {
        const root = document.documentElement;
        root.style.setProperty('--speedo-bg-opacity', opacity);
    };

    // Functions to change bar positions within speedo-root
    window.setLeftBarPosition = (position = 'static', top = 'auto', right = 'auto', bottom = 'auto', left = 'auto', alignSelf = 'flex-start') => {
        const root = document.documentElement;
        root.style.setProperty('--left-bars-position', position);
        root.style.setProperty('--left-bars-top', top);
        root.style.setProperty('--left-bars-right', right);
        root.style.setProperty('--left-bars-bottom', bottom);
        root.style.setProperty('--left-bars-left', left);
        root.style.setProperty('--left-bars-align-self', alignSelf);
    };

    window.setRightBarPosition = (position = 'static', top = 'auto', right = 'auto', bottom = 'auto', left = 'auto', alignSelf = 'flex-start') => {
        const root = document.documentElement;
        root.style.setProperty('--right-bars-position', position);
        root.style.setProperty('--right-bars-top', top);
        root.style.setProperty('--right-bars-right', right);
        root.style.setProperty('--right-bars-bottom', bottom);
        root.style.setProperty('--right-bars-left', left);
        root.style.setProperty('--right-bars-align-self', alignSelf);
    };

    // Function to center bars within speedo-root
    window.centerBars = () => {
        setLeftBarPosition('static', 'auto', 'auto', 'auto', 'auto', 'center');
        setRightBarPosition('static', 'auto', 'auto', 'auto', 'auto', 'center');
    };

    // Function to position bars anywhere on screen
    window.setBarsPosition = (leftPos, rightPos) => {
        if (leftPos) {
            setLeftBarPosition(leftPos.position || 'fixed', leftPos.top, leftPos.right, leftPos.bottom, leftPos.left);
        }
        if (rightPos) {
            setRightBarPosition(rightPos.position || 'fixed', rightPos.top, rightPos.right, rightPos.bottom, rightPos.left);
        }
    };

    window.setVehicleType = (type) => {
        vehicleState.isMotorcycle = type === 'motorcycle';

        if (els.icons.seatbelt) {
            if (vehicleState.isMotorcycle) {
                els.icons.seatbelt.style.display = 'none';
                manageLoopingAudio(els.audio.alarm, false); // Disable alarm for motorcycles
            } else {
                els.icons.seatbelt.style.display = '';
            }
        }
    };

    // RPM box
    if (els.rpm) {
        const box = document.createElement('div');
        box.className = 'rpm-box';
        box.textContent = '';
        els.rpm.appendChild(box);

        window.setRPM = (rpm) => {
            const rpmValue = Math.round(Math.max(0, Math.min(1, rpm)) * 8000); // Scale to 0-8000 RPM
            const isActive = rpm > 0.1; // Active when RPM is above 10%
            box.classList.toggle('on', isActive);
            if (isActive) {
                box.textContent = rpmValue.toString();
            } else {
                box.textContent = '';
            }
        };
    } else {
        window.setRPM = () => { };
    }

    window.setSpeed = (speed) => {
        if (!els.speed) return;
        const val = Math.round(Math.max(0, speed * 2.23694));
        els.speed.textContent = val;
        if (val > 0) vehicleState.hasMoved = true;

        // Update speed display color based on engine state and speed
        const root = document.documentElement;
        if (!vehicleState.engineOn) {
            // Engine off = white
            root.style.setProperty('--speed-color', '#ffffff');
            root.style.setProperty('--speed-glow', 'rgba(255, 255, 255, 0.8)');
        } else if (val >= 1 && val <= 40) {
            // 1-40 mph = green
            root.style.setProperty('--speed-color', '#00ff41');
            root.style.setProperty('--speed-glow', 'rgba(0, 255, 65, 0.8)');
        } else if (val >= 41 && val <= 50) {
            // 40-50 mph = yellow
            root.style.setProperty('--speed-color', '#ffff00');
            root.style.setProperty('--speed-glow', 'rgba(255, 255, 0, 0.8)');
        } else if (val > 50) {
            // Above 50 mph = red
            root.style.setProperty('--speed-color', '#ff0000');
            root.style.setProperty('--speed-glow', 'rgba(255, 0, 0, 0.8)');
        } else {
            // 0 mph with engine on = white
            root.style.setProperty('--speed-color', '#ffffff');
            root.style.setProperty('--speed-glow', 'rgba(255, 255, 255, 0.8)');
        }
    };

    window.setGear = (gear) => {
        if (!els.gear) return;

        let gearText;
        if (!vehicleState.engineOn) {
            gearText = 'N';
        } else {
            if (gear > 0) {
                gearText = gear;
            } else if (gear === 0 && vehicleState.hasMoved) {
                gearText = 'R';
            } else {
                gearText = 'N';
            }
        }

        const upperGear = String(gearText).toUpperCase();
        els.gear.textContent = upperGear;
        els.gear.classList.toggle('gear-reverse', upperGear === 'R');
    };

    window.setFuel = (val) => {
        if (!els.fuel) return;
        const p = Math.max(0, Math.min(1, val));
        const percentage = p * 100;

        // Update bar height
        els.fuel.style.transform = `translateY(${100 - percentage}%)`;

        // Update percentage text (removed since we don't show percentage anymore)
        // if (els.fuelPercent) els.fuelPercent.textContent = Math.round(percentage) + '%';

        // Update colors based on fuel percentage and engine state
        const root = document.documentElement;
        
        if (!vehicleState.engineOn) {
            // Engine off = transparent
            root.style.setProperty('--fuel-color', 'transparent');
            root.style.setProperty('--fuel-glow', 'rgba(0, 0, 0, 0)');
        } else if (percentage >= 60) {
            // Green for 60% and above
            root.style.setProperty('--fuel-color', '#44ff44');
            root.style.setProperty('--fuel-glow', 'rgba(68, 255, 68, 0.5)');
        } else if (percentage >= 40) {
            // Yellow for 40-59%
            root.style.setProperty('--fuel-color', '#ffff00');
            root.style.setProperty('--fuel-glow', 'rgba(255, 255, 0, 0.5)');
        } else {
            // Red for under 40%
            root.style.setProperty('--fuel-color', '#ff0000');
            root.style.setProperty('--fuel-glow', 'rgba(255, 0, 0, 0.5)');
        }
    };

    window.setHealth = (val) => {
        if (!els.health) return;
        const p = Math.max(0, Math.min(1, val));
        const percentage = p * 100;

        // Update engine health for icon effects
        vehicleState.engineHealth = p;

        // Update bar height
        els.health.style.transform = `translateY(${100 - percentage}%)`;

        // Update percentage text
        if (els.healthPercent) els.healthPercent.textContent = Math.round(percentage) + '%';

        // Update colors based on health percentage and engine state
        const root = document.documentElement;
        
        if (!vehicleState.engineOn) {
            // Engine off = transparent
            root.style.setProperty('--health-color', 'transparent');
            root.style.setProperty('--health-glow', 'rgba(0, 0, 0, 0)');
        } else if (percentage >= 60) {
            // Green for 60% and above
            root.style.setProperty('--health-color', '#00ff00');
            root.style.setProperty('--health-glow', 'rgba(0, 255, 0, 0.5)');
        } else if (percentage >= 40) {
            // Yellow for 40-59%
            root.style.setProperty('--health-color', '#ffff00');
            root.style.setProperty('--health-glow', 'rgba(255, 255, 0, 0.5)');
        } else {
            // Red for under 40%
            root.style.setProperty('--health-color', '#ff0000');
            root.style.setProperty('--health-glow', 'rgba(255, 0, 0, 0.5)');
        }

        // Update engine icon based on health
        updateEngineIcon();
    };

    window.setSeatbelts = (isBuckled) => {
        if (vehicleState.isMotorcycle) {
            manageLoopingAudio(els.audio.alarm, false); // Motor tidak pernah ada alarm
            return;
        }

        const isWearingBelt = !!isBuckled;
        const seatbeltIcon = els.icons.seatbelt;
        
        if (seatbeltIcon) {
            // Remove all seatbelt classes
            seatbeltIcon.classList.remove('active', 'seatbelt-warning');
            
            if (isWearingBelt) {
                // Buckled: green, no flashing
                seatbeltIcon.classList.add('active');
            } else {
                // Not buckled: flashing red
                seatbeltIcon.classList.add('seatbelt-warning');
            }
        }

        const shouldPlayAlarm = !isWearingBelt && vehicleState.engineOn;
        manageLoopingAudio(els.audio.alarm, shouldPlayAlarm);
    };

    window.setEngine = (on) => {
        const newState = !!on;
        if (vehicleState.engineOn === newState) return;

        vehicleState.engineOn = newState;
        
        if (!newState) {
            vehicleState.hasMoved = false;
            window.setGear('N');
            manageLoopingAudio(els.audio.alarm, false);
            
            // Set bars to 0% when engine is off
            window.setHealth(0);
            window.setFuel(0);
        } else {
            window.setGear(0);

            // If motorcycle, ensure alarm doesn't sound
            if (vehicleState.isMotorcycle) {
                manageLoopingAudio(els.audio.alarm, false);
                return;
            }

            const isSeatbeltIconActive =
                els.icons.seatbelt && els.icons.seatbelt.classList.contains('active');
            if (!isSeatbeltIconActive) {
                manageLoopingAudio(els.audio.alarm, true);
            }
        }

        // Update engine icon
        updateEngineIcon();

        // Update speed color when engine state changes
        const currentSpeed = els.speed ? parseInt(els.speed.textContent) || 0 : 0;
        window.setSpeed(currentSpeed / 2.23694); // Convert back to original units for color update
        
        // Update health bar color when engine state changes
        if (els.health) {
            const currentHealthTransform = els.health.style.transform;
            const match = currentHealthTransform.match(/translateY\((\d+)%\)/);
            if (match) {
                const currentPercentage = 100 - parseInt(match[1]);
                window.setHealth(currentPercentage / 100);
            }
        }
        
        // Update fuel bar color when engine state changes
        if (els.fuel) {
            const currentFuelTransform = els.fuel.style.transform;
            const match = currentFuelTransform.match(/translateY\((\d+)%\)/);
            if (match) {
                const currentPercentage = 100 - parseInt(match[1]);
                window.setFuel(currentPercentage / 100);
            }
        }
    };

    window.setHeadlights = (level) => {
        const lights = els.icons.lights;
        if (!lights) return;
        lights.classList.remove('low-beam', 'high-beam');
        if (level === 1) lights.classList.add('low-beam');
        else if (level === 2) lights.classList.add('high-beam');
    };

    const updateIndicators = () => {
        if (!els.icons.left || !els.icons.right) return;

        const leftActive = els.icons.left.classList.contains('active');
        const rightActive = els.icons.right.classList.contains('active');

        els.icons.left.classList.remove('is-blinking');
        els.icons.right.classList.remove('is-blinking');

        if (leftActive && rightActive) {
            els.icons.left.classList.add('is-blinking');
            els.icons.right.classList.add('is-blinking');
        } else if (leftActive) {
            els.icons.left.classList.add('is-blinking');
        } else if (rightActive) {
            els.icons.right.classList.add('is-blinking');
        }

        manageLoopingAudio(els.audio.tick, leftActive || rightActive);
    };

    window.setLeftIndicator = (on) => {
        toggleIcon('left', on);
        updateIndicators();
    };

    window.setRightIndicator = (on) => {
        toggleIcon('right', on);
        updateIndicators();
    };

    // Initialize bars to 0% since engine starts as off
    window.setHealth(0);
    window.setFuel(0);
});