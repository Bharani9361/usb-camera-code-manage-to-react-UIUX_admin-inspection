import React, { useRef, useEffect } from 'react';

const EffectsCanvas = () => {
    // // Fireworks
    // const canvasRef = useRef(null);

    // useEffect(() => {
    //     const canvas = canvasRef.current;
    //     const ctx = canvas.getContext('2d');
    //     canvas.width = window.innerWidth;
    //     canvas.height = window.innerHeight;

    //     let particles = [];

    //     class Particle {
    //         constructor(x, y, vx, vy, size, color) {
    //             this.x = x;
    //             this.y = y;
    //             this.vx = vx;
    //             this.vy = vy;
    //             this.size = size;
    //             this.color = color;
    //             this.life = 100;
    //         }

    //         update() {
    //             this.x += this.vx;
    //             this.y += this.vy;
    //             this.vy += 0.05; // Gravity
    //             this.life -= 1;
    //         }

    //         draw() {
    //             ctx.beginPath();
    //             ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    //             ctx.fillStyle = this.color;
    //             ctx.fill();
    //         }
    //     }

    //     const createFirework = (x, y) => {
    //         const colors = ['#FF1461', '#18FF92', '#5A87FF', '#FBF38C'];
    //         const numParticles = 100;
    //         for (let i = 0; i < numParticles; i++) {
    //             const vx = (Math.random() - 0.5) * 4;
    //             const vy = (Math.random() - 0.5) * 4;
    //             const size = Math.random() * 2 + 1;
    //             const color = colors[Math.floor(Math.random() * colors.length)];
    //             particles.push(new Particle(x, y, vx, vy, size, color));
    //         }
    //     };

    //     const animate = () => {
    //         ctx.clearRect(0, 0, canvas.width, canvas.height);

    //         particles.forEach((particle, index) => {
    //             particle.update();
    //             particle.draw();
    //             if (particle.life <= 0) {
    //                 particles.splice(index, 1);
    //             }
    //         });

    //         if (Math.random() < 0.05) {
    //             createFirework(Math.random() * canvas.width, Math.random() * canvas.height);
    //         }

    //         requestAnimationFrame(animate);
    //     };

    //     animate();
    // }, []);

    // return <canvas className='page-content' ref={canvasRef} style={{ width: '100%', height: '100%' }} />;

    // // Rain Effect
    // const canvasRef = useRef(null);

    // useEffect(() => {
    //     const canvas = canvasRef.current;
    //     const ctx = canvas.getContext('2d');
    //     canvas.width = window.innerWidth;
    //     canvas.height = window.innerHeight;

    //     let raindrops = [];

    //     class Raindrop {
    //         constructor(x, y, vy, length) {
    //             this.x = x;
    //             this.y = y;
    //             this.vy = vy;
    //             this.length = length;
    //         }

    //         update() {
    //             this.y += this.vy;
    //             if (this.y > canvas.height) {
    //                 this.y = 0 - this.length;
    //             }
    //         }

    //         draw() {
    //             ctx.beginPath();
    //             ctx.moveTo(this.x, this.y);
    //             ctx.lineTo(this.x, this.y + this.length);
    //             ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
    //             ctx.lineWidth = 4;
    //             ctx.stroke();
    //         }
    //     }

    //     const createRaindrops = () => {
    //         const numRaindrops = 100;
    //         for (let i = 0; i < numRaindrops; i++) {
    //             const x = Math.random() * canvas.width;
    //             const y = Math.random() * canvas.height;
    //             const vy = Math.random() * 4 + 2;
    //             const length = Math.random() * 20 + 10;
    //             raindrops.push(new Raindrop(x, y, vy, length));
    //         }
    //     };

    //     const animate = () => {
    //         ctx.clearRect(0, 0, canvas.width, canvas.height);

    //         raindrops.forEach(raindrop => {
    //             raindrop.update();
    //             raindrop.draw();
    //         });

    //         requestAnimationFrame(animate);
    //     };

    //     createRaindrops();
    //     animate();
    // }, []);

    // return <canvas className='page-content' ref={canvasRef} style={{ width: '100%', height: '100%' }} />;


    // // Bouncing Balls
    // const canvasRef = useRef(null);

    // useEffect(() => {
    //     const canvas = canvasRef.current;
    //     const ctx = canvas.getContext('2d');
    //     canvas.width = window.innerWidth;
    //     canvas.height = window.innerHeight;

    //     let balls = [];

    //     class Ball {
    //         constructor(x, y, vx, vy, radius, color) {
    //             this.x = x;
    //             this.y = y;
    //             this.vx = vx;
    //             this.vy = vy;
    //             this.radius = radius;
    //             this.color = color;
    //         }

    //         update() {
    //             if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
    //                 this.vx = -this.vx;
    //             }
    //             if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
    //                 this.vy = -this.vy;
    //             }
    //             this.x += this.vx;
    //             this.y += this.vy;
    //         }

    //         draw() {
    //             ctx.beginPath();
    //             ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    //             ctx.fillStyle = this.color;
    //             ctx.fill();
    //             ctx.closePath();
    //         }
    //     }

    //     const createBalls = () => {
    //         const colors = ['#FF6347', '#FFD700', '#1E90FF', '#32CD32'];
    //         const numBalls = 20;
    //         for (let i = 0; i < numBalls; i++) {
    //             const x = Math.random() * canvas.width;
    //             const y = Math.random() * canvas.height;
    //             const vx = (Math.random() - 0.5) * 4;
    //             const vy = (Math.random() - 0.5) * 4;
    //             const radius = Math.random() * 20 + 10;
    //             const color = colors[Math.floor(Math.random() * colors.length)];
    //             balls.push(new Ball(x, y, vx, vy, radius, color));
    //         }
    //     };

    //     const animate = () => {
    //         ctx.clearRect(0, 0, canvas.width, canvas.height);

    //         balls.forEach(ball => {
    //             ball.update();
    //             ball.draw();
    //         });

    //         requestAnimationFrame(animate);
    //     };

    //     createBalls();
    //     animate();
    // }, []);

    // return <canvas className='page-content' ref={canvasRef} style={{ width: '100%', height: '100%' }} />;

    // // // Snowfall Effects
    // const canvasRef = useRef(null);

    // useEffect(() => {
    //     const canvas = canvasRef.current;
    //     const ctx = canvas.getContext('2d');
    //     canvas.width = window.innerWidth;
    //     canvas.height = window.innerHeight;

    //     let snowflakes = [];

    //     class Snowflake {
    //         constructor(x, y, vy, radius) {
    //             this.x = x;
    //             this.y = y;
    //             this.vy = vy;
    //             this.radius = radius;
    //             this.angle = Math.random() * Math.PI * 2;
    //             this.speed = Math.random() * 0.1 + 0.05;
    //         }

    //         update() {
    //             this.y += this.vy;
    //             this.angle += this.speed;
    //             this.x += Math.sin(this.angle) * 2;

    //             if (this.y > canvas.height) {
    //                 this.y = 0 - this.radius;
    //                 this.x = Math.random() * canvas.width;
    //             }
    //         }

    //         draw() {
    //             ctx.beginPath();
    //             ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    //             // ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    //             ctx.fillStyle = 'rgba(0, 200, 0, 0.8)';
    //             ctx.fill();
    //         }
    //     }

    //     const createSnowflakes = () => {
    //         const numSnowflakes = 100;
    //         for (let i = 0; i < numSnowflakes; i++) {
    //             const x = Math.random() * canvas.width;
    //             const y = Math.random() * canvas.height;
    //             const vy = Math.random() * 2 + 1;
    //             const radius = Math.random() * 3 + 2;
    //             snowflakes.push(new Snowflake(x, y, vy, radius));
    //         }
    //     };

    //     const animate = () => {
    //         ctx.clearRect(0, 0, canvas.width, canvas.height);

    //         snowflakes.forEach(snowflake => {
    //             snowflake.update();
    //             snowflake.draw();
    //         });

    //         requestAnimationFrame(animate);
    //     };

    //     createSnowflakes();
    //     animate();
    // }, []);

    // return <canvas className='page-content' ref={canvasRef} style={{ width: '100%', height: '100%' }} />;

    // // Starfield animation
    const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let stars = [];

    class Star {
      constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
      }

      update() {
        this.z -= 0.2;
        if (this.z <= 0) {
          this.z = canvas.width;
          this.x = Math.random() * canvas.width - canvas.width / 2;
          this.y = Math.random() * canvas.height - canvas.height / 2;
        }
      }

      draw() {
        const sx = (this.x / this.z) * canvas.width + canvas.width / 2;
        const sy = (this.y / this.z) * canvas.height + canvas.height / 2;
        const radius = (canvas.width / this.z) * 2;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
      }
    }

    const createStars = () => {
      const numStars = 200;
      for (let i = 0; i < numStars; i++) {
        const x = Math.random() * canvas.width - canvas.width / 2;
        const y = Math.random() * canvas.height - canvas.height / 2;
        const z = Math.random() * canvas.width;
        stars.push(new Star(x, y, z));
      }
    };

    const animate = () => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        star.update();
        star.draw();
      });

      requestAnimationFrame(animate);
    };

    createStars();
    animate();
  }, []);

  return <canvas className='page-content' ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default EffectsCanvas;
