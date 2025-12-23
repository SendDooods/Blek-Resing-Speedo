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
            fuel: document.getElementById('icon-fuel'),
            lowBeam: document.getElementById('icon-low-beam'),
            highBeam: document.getElementById('icon-high-beam'),
            left: document.getElementById('icon-left'),
            right: document.getElementById('icon-right'),
            seatbelt: document.getElementById('icon-seatbelt')
        },
        audio: {
            tick: document.getElementById('audio-tick'),
            seatbeltWarning: document.getElementById('audio-seatbelt-warning')
        }
    };

    const vehicleState = {
        engineOn: false,
        hasMoved: false,
        isMotorcycle: true,
        engineHealth: 1.0
    };

    const manageLoopingAudio = (audioEl, shouldPlay) => {
        if (!audioEl) return;

        if (shouldPlay) {
            if (audioEl.paused) {
                audioEl.currentTime = 0;
                audioEl.play().catch(e => console.log('Audio play failed:', e));
            }
        } else {
            if (!audioEl.paused) {
                audioEl.pause();
                audioEl.currentTime = 0;
            }
        }
    };


    const toggleIcon = (id, state) => {
        const icon = els.icons[id];
        if (!icon) return;

        const image = icon.querySelector('image');
        if (!image) return;

        if (id === 'left' || id === 'right') {
            if (state) {
                // Active: orange color
                image.setAttribute('filter', `url(#${id}FilterActive)`);
                icon.style.opacity = '1';
                icon.classList.add('active');
            } else {
                // Inactive: original colors with full opacity
                image.setAttribute('filter', 'none');
                icon.style.opacity = '1';
                icon.classList.remove('active');
            }
        } else {
            // For other icons, use the old method
            icon.classList.toggle('active', !!state);
        }
    };

    const updateEngineIcon = () => {
        const engineIcon = els.icons.engine;
        if (!engineIcon) return;
        const image = engineIcon.querySelector('image');
        if (!image) return;

        // Remove all engine-specific classes
        engineIcon.classList.remove('engine-warning', 'engine-critical');

        if (!vehicleState.engineOn) {
            // Engine off: greyed out
            image.setAttribute('filter', 'url(#engineFilterGrey)');
            engineIcon.style.opacity = '1';
            return;
        }

        // Engine on: color based on health
        const healthPercentage = vehicleState.engineHealth * 100;

        if (healthPercentage === 100) {
            // Green for exactly 100% health
            image.setAttribute('filter', 'url(#engineFilterGreen)');
        } else if (healthPercentage >= 50) {
            // Yellow for 50-99% health
            image.setAttribute('filter', 'url(#engineFilterYellow)');
        } else if (healthPercentage >= 20) {
            // Yellow for 20-49% health (same as above)
            image.setAttribute('filter', 'url(#engineFilterYellow)');
        } else {
            // Red for 0-19% health
            image.setAttribute('filter', 'url(#engineFilterRed)');
        }
    };

    const updateFuelIcon = (fuelPercentage) => {
        const fuelIcon = els.icons.fuel;
        if (!fuelIcon) return;
        const image = fuelIcon.querySelector('image');
        if (!image) return;

        // Remove all fuel-specific classes
        fuelIcon.classList.remove('fuel-high', 'fuel-medium', 'fuel-low');

        if (!vehicleState.engineOn) {
            // Engine off: greyed out
            image.setAttribute('filter', 'url(#fuelFilterGrey)');
            fuelIcon.style.opacity = '1';
            return;
        }

        // Engine on: show fuel level colors using SVG filters
        if (fuelPercentage >= 50) {
            // Green for 50% and above
            image.setAttribute('filter', 'url(#fuelFilterHigh)');
        } else if (fuelPercentage >= 10) {
            // Yellow for 10-49%
            image.setAttribute('filter', 'url(#fuelFilterMedium)');
        } else {
            // Red blinking for 0-9%
            image.setAttribute('filter', 'url(#fuelFilterLow)');
            fuelIcon.classList.add('fuel-low');
        }

        
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
                manageLoopingAudio(els.audio.seatbeltWarning, false); // Disable seatbelt warning for motorcycles
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
            const rpmPercentage = Math.max(0, Math.min(100, rpm * 100)); // Convert to 0-100%
            const isActive = rpm > 0.1; // Active when RPM is above 10%
            const isRedline = rpm > 0.8; // Red when RPM is above 80% (near gear change)

            // Remove all classes first
            box.classList.remove('on', 'redline');

            if (isActive) {
                if (isRedline) {
                    box.classList.add('redline');
                } else {
                    box.classList.add('on');
                }
                box.textContent = rpmValue.toString();
            } else {
                box.textContent = '';
            }

            // Update the ::before element width
            box.style.setProperty('--fill-width', rpmPercentage + '%');
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

        // Update fuel icon based on fuel level and engine state
        updateFuelIcon(percentage);
    };

    window.setHealth = (val) => {
        if (!els.health) return;
        const p = Math.max(0, Math.min(1, val));
        const percentage = p * 100;

        // Update engine health for icon effects
        vehicleState.engineHealth = p;

        // Update bar height
        els.health.style.transform = `translateY(${100 - percentage}%)`;

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
            manageLoopingAudio(els.audio.seatbeltWarning, false);
            return;
        }

        const isWearingBelt = !!isBuckled;
        const seatbeltIcon = els.icons.seatbelt;

        if (seatbeltIcon) {
            const image = seatbeltIcon.querySelector('image');
            if (image) {
                seatbeltIcon.classList.remove('active', 'seatbelt-warning');

                if (!vehicleState.engineOn) {
                    image.setAttribute('filter', 'none');
                    seatbeltIcon.style.opacity = '1';
                } else if (isWearingBelt) {
                    image.setAttribute('filter', 'url(#seatbeltFilterActive)');
                    seatbeltIcon.style.opacity = '1';
                } else {
                    image.setAttribute('filter', 'url(#seatbeltFilterWarning)');
                    seatbeltIcon.style.opacity = '1';
                    seatbeltIcon.classList.add('seatbelt-warning');
                }
            }
        }

        const shouldPlaySeatbeltWarning = !isWearingBelt && vehicleState.engineOn;
        manageLoopingAudio(els.audio.seatbeltWarning, shouldPlaySeatbeltWarning);
    };

    window.setEngine = (on) => {
        const newState = !!on;
        if (vehicleState.engineOn === newState) return;

        vehicleState.engineOn = newState;

        if (!newState) {
            vehicleState.hasMoved = false;
            window.setGear('N');
            manageLoopingAudio(els.audio.seatbeltWarning, false);

            // Set bars to 0% when engine is off
            window.setHealth(0);
            window.setFuel(0);
            window.setRPM(0);
        } else {
            window.setGear(0);

            if (vehicleState.isMotorcycle) {
                manageLoopingAudio(els.audio.seatbeltWarning, false);
            } else {
                const isSeatbeltIconActive =
                    els.icons.seatbelt && els.icons.seatbelt.classList.contains('active');
                if (!isSeatbeltIconActive) {
                    manageLoopingAudio(els.audio.seatbeltWarning, true);
                }
            }
        }

        // Update engine icon
        updateEngineIcon();

        // Update speed color when engine state changes
        const currentSpeed = els.speed ? parseInt(els.speed.textContent) || 0 : 0;
        window.setSpeed(currentSpeed / 2.23694);

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
        const lowBeam = els.icons.lowBeam;
        const highBeam = els.icons.highBeam;

        if (!lowBeam || !highBeam) return;

        const lowBeamImage = lowBeam.querySelector('image');
        const highBeamImage = highBeam.querySelector('image');

        if (!lowBeamImage || !highBeamImage) return;

        lowBeam.classList.remove('active', 'hidden');
        highBeam.classList.remove('active', 'hidden');

        if (level === 1) {
            lowBeamImage.setAttribute('filter', 'url(#lowBeamFilterActive)');
            lowBeam.style.opacity = '1';
            highBeam.style.opacity = '0';
        } else if (level === 2) {
            highBeamImage.setAttribute('filter', 'url(#highBeamFilterActive)');
            highBeam.style.opacity = '1';
            lowBeam.style.opacity = '0';
        } else {
            lowBeamImage.setAttribute('filter', 'url(#lowBeamFilterGrey)');
            highBeamImage.setAttribute('filter', 'url(#highBeamFilterGrey)');
            lowBeam.style.opacity = '1';
            highBeam.style.opacity = '1';
        }
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
    window.setRPM(0);
});